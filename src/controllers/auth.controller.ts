import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.register(email, password, firstName, lastName);
      sendSuccess(res, result, result.message, 201);
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOTP(email, otp);
      sendSuccess(res, result, 'Email verified successfully');
    } catch (err) {
      next(err);
    }
  }

  async resendOTP(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.resendOTP(email);
      sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async googleAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const result = await authService.googleAuth(idToken);
      sendSuccess(
        res,
        result,
        result.isNewUser ? 'Account created successfully' : 'Login successful',
        result.isNewUser ? 201 : 200
      );
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.id);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, req.user, 'User info retrieved');
    } catch (err) {
      next(err);
    }
  }

  async testEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sendOTPEmail } = await import('../utils/email');
      const { env } = await import('../config/env');
      const to = req.body?.email || 'test@example.com';
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        res.status(500).json({
          success: false,
          message: 'SMTP_USER or SMTP_PASS not configured in environment variables',
          configured: { smtp_user: !!env.SMTP_USER, smtp_pass: !!env.SMTP_PASS },
        });
        return;
      }
      await sendOTPEmail(to, 'Test', '123456');
      res.json({ success: true, message: `Test OTP email sent to ${to}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, error: err.toString() });
    }
  }
}

export const authController = new AuthController();
