import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Refresh tokens are already long random strings — SHA-256 is instant + equally secure
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function compareToken(token: string, hash: string): boolean {
  const tokenHash = Buffer.from(crypto.createHash('sha256').update(token).digest('hex'));
  const storedHash = Buffer.from(hash);
  if (tokenHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(tokenHash, storedHash);
}

export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// HMAC-SHA256 for OTPs — instant (vs ~100ms bcrypt). Safe because OTPs
// are rate-limited, short-lived (10 min), and the key is server-side only.
export function hashOTP(otp: string): string {
  return crypto
    .createHmac('sha256', env.ENCRYPTION_KEY)
    .update(otp)
    .digest('hex');
}

export function verifyOTPHash(otp: string, storedHash: string): boolean {
  const expected = Buffer.from(hashOTP(otp));
  const stored = Buffer.from(storedHash);
  if (expected.length !== stored.length) return false;
  return crypto.timingSafeEqual(expected, stored);
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function encrypt(text: string): string {
  const key = Buffer.from(env.ENCRYPTION_KEY.slice(0, 32), 'utf-8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = Buffer.from(env.ENCRYPTION_KEY.slice(0, 32), 'utf-8');
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
