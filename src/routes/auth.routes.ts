import { Router } from 'express';
import { authController, registerSchema, loginSchema, otpSchema, googleAuthSchema, refreshSchema } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/verify-otp', otpLimiter, validate(otpSchema), authController.verifyOTP.bind(authController));
router.post('/resend-otp', otpLimiter, authController.resendOTP.bind(authController));
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth.bind(authController));
router.post('/refresh', validate(refreshSchema), authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export { router as authRouter };
