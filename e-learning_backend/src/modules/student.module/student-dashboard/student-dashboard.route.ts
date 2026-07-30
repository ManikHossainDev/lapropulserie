import { Router } from 'express';
import { StudentDashboardController } from './student-dashboard.controller';
import auth from '../../../middlewares/auth';
import { MentorsRoute } from '../mentors/mentors.route';

const router = Router();
router.get(
  '/capsule-categories',
  auth(),
  StudentDashboardController.getCapsuleCategories,
);
router.use('/mentors', MentorsRoute);
router.get('/capsules', auth(), StudentDashboardController.getCapsules);
router.get('/progress', auth(), StudentDashboardController.getStudentProgress);
router.get('/my-mentors', auth(), StudentDashboardController.getMyMentors);
router.get('/completed-journeys', auth(), StudentDashboardController.getCompletedJourneys);
router.get('/my-capsules', auth(), StudentDashboardController.getMyCapsules);
router.get('/my-capsules/:capsuleId', auth(), StudentDashboardController.getCapsuleDetails);
router.get('/my-capsules/:capsuleId/modules/:moduleId', auth(), StudentDashboardController.getModuleLessons);
router.get('/my-capsules/:capsuleId/modules/:moduleId/lessons/:lessonId', auth(), StudentDashboardController.getLessonContent);
router.get('/questionnaire-summary', auth(), StudentDashboardController.getQuestionnaireSummary);
router.get('/recommendations', auth(), StudentDashboardController.getRecommendations);

export const StudentDashboardRoute = router;
