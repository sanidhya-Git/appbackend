import { Router } from 'express';
import { eventController, createEventSchema, joinEventSchema, uploadPhotoSchema } from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// Public-to-members routes
router.get('/',            eventController.listEvents.bind(eventController));
router.post('/',           validate(createEventSchema), eventController.createEvent.bind(eventController));
router.post('/join',       validate(joinEventSchema),   eventController.joinEvent.bind(eventController));
router.get('/:id',         eventController.getEvent.bind(eventController));
router.get('/:id/photos',  eventController.getEventPhotos.bind(eventController));
router.post('/:id/photos', validate(uploadPhotoSchema), eventController.uploadPhoto.bind(eventController));
router.get('/:id/members', eventController.getEventMembers.bind(eventController));
router.get('/:id/search',  eventController.searchMyPhotos.bind(eventController));

// Admin-only
router.post('/:id/sync', authorize('ADMIN'), eventController.syncPhotos.bind(eventController));

export { router as eventRouter };
