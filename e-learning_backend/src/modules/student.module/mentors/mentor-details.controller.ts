import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MentorDetailsService } from './mentor-details.service';

const getUserId = (req: Request): string => {
  const user = req.user as any;
  const id = user?.userId;
  return id ? String(id) : '';
};

const getMentorDetails = catchAsync(async (req: Request, res: Response) => {
  const { mentorId } = req.params;
  const result = await MentorDetailsService.getMentorDetails(String(mentorId));

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Mentor details fetched successfully',
    data: result,
  });
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
  const { mentorId } = req.params;
  const studentId = getUserId(req);
  const { review, rating } = req.body;

  const result = await MentorDetailsService.submitReview(
    String(mentorId),
    studentId,
    review,
    rating,
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const bookSession = catchAsync(async (req: Request, res: Response) => {
  const { mentorId } = req.params;
  const studentId = getUserId(req);

  const result = await MentorDetailsService.bookSession(
    String(mentorId),
    studentId,
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Session booking info retrieved',
    data: result,
  });
});

export const MentorDetailsController = {
  getMentorDetails,
  submitReview,
  bookSession,
};
