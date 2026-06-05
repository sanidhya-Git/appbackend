import { Router } from 'express';
import { faceController, registerFaceSchema } from '../controllers/face.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const faceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

router.use(authenticate);
router.post('/register', faceLimiter, validate(registerFaceSchema), faceController.registerFace.bind(faceController));
router.post('/verify-quality', faceLimiter, validate(registerFaceSchema), faceController.verifyFaceQuality.bind(faceController));

export { router as faceRouter };
