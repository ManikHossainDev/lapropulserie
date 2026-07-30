import { Router } from 'express';
import { MentorsController } from './mentors.controller';
import auth from '../../../middlewares/auth';

const router = Router();

router.get('/', auth(), MentorsController.getMentors);
router.get(
  '/book-session-again',
  auth(),
  MentorsController.getBookSessionAgain,
);
router.get(
  '/my-booked-sessions',
  auth(),
  MentorsController.getMyBookedSessions,
);

router.get('/:mentorId', auth(), MentorsController.getMentorDetails);
router.post('/:mentorId/review', auth(), MentorsController.submitReview);
router.post(
  '/:mentorId/book-session',
  auth(),
  MentorsController.bookSession,
);

export const MentorsRoute = router;
