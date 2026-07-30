import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StudentDashboardService } from './student-dashboard.service';

const getUserId = (req: Request): string => {
  const user = req.user as any;
  const id = user?.userId || user?._id;
  return id ? String(id) : '';
};





const getTopMentors = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getTopMentors(
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Top mentors fetched successfully',
    data: result,
  });
});

const getCapsuleCategories = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getCapsuleCategories(
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Capsule categories fetched successfully',
    data: result,
  });
});

const getCapsules = catchAsync(async (req: Request, res: Response) => {
  const { categoryId, rating, page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getCapsules(
    categoryId as string,
    rating ? Number(rating) : undefined,
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Capsules fetched successfully',
    data: result,
  });
});

const getStudentProgress = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const result = await StudentDashboardService.getStudentProgress(studentId);

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Student progress fetched successfully',
    data: result,
  });
});

const getMyMentors = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getMyMentors(studentId, Number(page), Number(limit));

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'My mentors fetched successfully',
    data: result,
  });
});

const getCompletedJourneys = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getCompletedJourneys(studentId, Number(page), Number(limit));

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Completed journeys fetched successfully',
    data: result,
  });
});

const getMyCapsules = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { type = 'all', page = 1, limit = 10 } = req.query;
  const result = await StudentDashboardService.getMyCapsules(
    studentId,
    type as 'purchased' | 'gifted' | 'suggested' | 'all',
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'My capsules fetched successfully',
    data: result,
  });
});

const getCapsuleDetails = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { capsuleId } = req.params;
  if (!capsuleId || Array.isArray(capsuleId)) {
    throw new Error('Invalid capsuleId');
  }
  const result = await StudentDashboardService.getCapsuleDetails(studentId, capsuleId);

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Capsule details fetched successfully',
    data: result,
  });
});

const getModuleLessons = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { capsuleId, moduleId } = req.params;
  if (!capsuleId || Array.isArray(capsuleId) || !moduleId || Array.isArray(moduleId)) {
    throw new Error('Invalid capsuleId or moduleId');
  }
  const result = await StudentDashboardService.getModuleLessons(studentId, capsuleId, moduleId);

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Module lessons fetched successfully',
    data: result,
  });
});

const getLessonContent = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { capsuleId, moduleId, lessonId } = req.params;
  if (!capsuleId || Array.isArray(capsuleId) || !moduleId || Array.isArray(moduleId) || !lessonId || Array.isArray(lessonId)) {
    throw new Error('Invalid capsuleId, moduleId or lessonId');
  }
  const result = await StudentDashboardService.getLessonContent(studentId, capsuleId, moduleId, lessonId);

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Lesson content fetched successfully',
    data: result,
  });
});

const getQuestionnaireSummary = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const result = await StudentDashboardService.getOrGenerateQuestionnaireSummary(studentId);

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Questionnaire summary fetched successfully',
    data: result,
  });
});

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { context = 'discover', capsuleId, journeyId } = req.query;

  const result = await StudentDashboardService.getPersonalizedRecommendations(
    studentId,
    context as 'questionnaire' | 'capsule_complete' | 'journey_complete' | 'discover',
    {
      capsuleId: capsuleId as string | undefined,
      journeyId: journeyId as string | undefined,
    },
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Recommendations fetched successfully',
    data: result,
  });
});

export const StudentDashboardController = {
  getTopMentors,
  getCapsuleCategories,
  getCapsules,
  getStudentProgress,
  getMyMentors,
  getCompletedJourneys,
  getMyCapsules,
  getCapsuleDetails,
  getModuleLessons,
  getLessonContent,
  getQuestionnaireSummary,
  getRecommendations,
};
