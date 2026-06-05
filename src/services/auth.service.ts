import { prisma } from '../config/database';
import { redis } from '../config/redis';
import {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
  generateOTP,
} from '../utils/crypto';
import { generateTokenPair, TokenPair, verifyRefreshToken } from '../utils/jwt';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email';
import { AppError } from '../middleware/error.middleware';
import { AuthProvider, User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const OTP_EXPIRY_MINUTES = 10;
const OTP_REDIS_PREFIX = 'otp:';

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ message: string }> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOTP();
    const otpHash = await hashPassword(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        provider: AuthProvider.EMAIL,
        otpHash,
        otpExpiresAt,
      },
    });

    try {
      await sendOTPEmail(email, firstName, otp);
    } catch (emailError) {
      logger.warn('OTP email delivery failed, user can request resend:', emailError);
    }
    return { message: 'Registration successful. Check your email for OTP.' };
  }

  async verifyOTP(
    email: string,
    otp: string
  ): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (user.isVerified) throw new AppError('Email already verified', 400);
    if (!user.otpHash || !user.otpExpiresAt) {
      throw new AppError('No pending OTP', 400);
    }
    if (new Date() > user.otpExpiresAt) {
      throw new AppError('OTP expired', 400);
    }

    const isValid = await comparePassword(otp, user.otpHash);
    if (!isValid) throw new AppError('Invalid OTP', 400);

    const tokens = generateTokenPair(user.id, user.email, user.role);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpHash: null,
        otpExpiresAt: null,
        refreshTokenHash,
      },
    });

    // Fire and forget — don't block the response
    sendWelcomeEmail(email, user.firstName).catch((err) =>
      logger.warn('Welcome email failed:', err)
    );

    return { user: this.sanitizeUser(updated), tokens };
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (user.isVerified) throw new AppError('Email already verified', 400);

    try {
      const rateLimitKey = `${OTP_REDIS_PREFIX}ratelimit:${email}`;
      const attempts = await redis.incr(rateLimitKey);
      if (attempts === 1) await redis.expire(rateLimitKey, 300);
      if (attempts > 3) throw new AppError('Too many OTP requests. Wait 5 minutes.', 429);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.warn('Redis unavailable, skipping OTP rate limit');
    }

    const otp = generateOTP();
    const otpHash = await hashPassword(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpHash, otpExpiresAt },
    });

    await sendOTPEmail(email, user.firstName, otp);
    return { message: 'OTP resent successfully' };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.isVerified) {
      throw new AppError('Please verify your email first', 403);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const tokens = generateTokenPair(user.id, user.email, user.role);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return { user: this.sanitizeUser(user), tokens };
  }

  async googleAuth(
    idToken: string
  ): Promise<{ user: Partial<User>; tokens: TokenPair; isNewUser: boolean }> {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 401);
    }

    const { email, sub, given_name, family_name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || 'User',
          lastName: family_name || '',
          avatarUrl: picture,
          provider: AuthProvider.GOOGLE,
          providerId: sub,
          isVerified: true,
        },
      });
      isNewUser = true;
    } else if (user.provider !== AuthProvider.GOOGLE) {
      throw new AppError('Email already registered with different provider', 409);
    }

    const tokens = generateTokenPair(user.id, user.email, user.role);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return { user: this.sanitizeUser(user), tokens, isNewUser };
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<{ tokens: TokenPair }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.refreshTokenHash) {
      throw new AppError('Invalid refresh token', 401);
    }

    const isValid = compareToken(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new AppError('Invalid refresh token', 401);

    const tokens = generateTokenPair(user.id, user.email, user.role);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return { tokens };
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, refreshTokenHash, otpHash, otpExpiresAt, ...safe } = user;
    return safe;
  }
}

export const authService = new AuthService();
