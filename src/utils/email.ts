import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
});

export async function sendOTPEmail(
  to: string,
  firstName: string,
  otp: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${env.APP_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject: `${otp} is your ${env.APP_NAME} verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
          <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 8px;">Verify your email</h1>
          <p style="color: #666; font-size: 16px; margin-bottom: 32px;">Hi ${firstName}, enter this code to verify your account.</p>
          <div style="background: #f4f4f8; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #6366f1;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #ccc; font-size: 12px;">© 2024 ${env.APP_NAME}. All rights reserved.</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWelcomeEmail(
  to: string,
  firstName: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${env.APP_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject: `Welcome to ${env.APP_NAME}! 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a2e;">Welcome, ${firstName}!</h1>
          <p style="color: #666; font-size: 16px;">Your account is verified. Register your face to start finding your photos in events.</p>
          <a href="${env.FRONTEND_URL}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px;">Open App</a>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
  }
}
