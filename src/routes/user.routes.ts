import { Router } from 'express';
import { userController, updateProfileSchema, updateAvatarSchema } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile.bind(userController));
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile.bind(userController));
router.post('/avatar', validate(updateAvatarSchema), userController.updateAvatar.bind(userController));
router.get('/dashboard', userController.getDashboard.bind(userController));
router.get('/my-photos', userController.getMyPhotos.bind(userController));
router.post('/photos/:photoId/favorite', userController.toggleFavorite.bind(userController));
router.get('/favorites', userController.getFavorites.bind(userController));
router.get('/notifications', userController.getNotifications.bind(userController));
router.post('/notifications/read', userController.markNotificationsRead.bind(userController));

export { router as userRouter };
