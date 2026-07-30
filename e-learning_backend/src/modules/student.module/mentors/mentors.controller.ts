import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MentorsService } from './mentors.service';
import { IUser } from '../../token/token.interface';
import { PaymentService } from '../../payment.module/payment/payment.service';
import { StripeGateway } from '../../payment.module/payment/gateways/stripe/stripe.gateway';
import { MentorSessionPurchaseStrategy } from './mentor-session-purchase-strategy';

const paymentService = new PaymentService();
paymentService.registerStrategy('MentorSession', new MentorSessionPurchaseStrategy());
paymentService.registerGateway('stripe', new StripeGateway());

const getUserId = (req: Request): string => {
  const user = req.user as any;
  const id = user?.userId;
  return id ? String(id) : '';
};

const getMentors = catchAsync(async (req: Request, res: Response) => {
  const { type, page = 1, limit = 10 } = req.query;
  const studentId = getUserId(req);
  let result;

  if (type === 'recommended') {
    result = await MentorsService.getRecommendedMentorsWithGeneration(
      studentId,
      Number(page),
      Number(limit),
    );
  } else if (type === 'top') {
    result = await MentorsService.getTopMentorsForMentor(
      Number(page),
      Number(limit),
    );
  } else if (type === 'booked') {
    result = await MentorsService.getBookSessionAgainStudents(
      studentId,
      Number(page),
      Number(limit),
    );
  } else {
    return sendResponse(res, {
      code: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid type parameter. Use ?type=recommended, ?type=top, or ?type=booked',
    });
  }

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: `${type} mentors fetched successfully`,
    data: result,
  });
});

const getBookSessionAgain = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { page = 1, limit = 10 } = req.query;
  const result = await MentorsService.getBookSessionAgainStudents(
    studentId,
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Book session again list fetched successfully',
    data: result,
  });
});

const getRecommendedMentors = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = getUserId(req);
    const { page = 1, limit = 10 } = req.query;
    const result = await MentorsService.getRecommendedMentorsForMentor(
      studentId,
      Number(page),
      Number(limit),
    );

    sendResponse(res, {
      code: httpStatus.OK,
      success: true,
      message: 'Recommended mentors fetched successfully',
      data: result,
    });
  },
);

const getTopMentors = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await MentorsService.getTopMentorsForMentor(
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

const getMentorDetails = catchAsync(async (req: Request, res: Response) => {
  const { mentorId } = req.params;
  const result = await MentorsService.getMentorDetails(String(mentorId));

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

  const result = await MentorsService.submitReview(
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
  const mentorId = req.params.mentorId as string;
  const studentId = getUserId(req);

  console.log('bookSession called with mentorId:', mentorId, 'studentId:', studentId);

  const result = await paymentService.processPayment(
    'MentorSession',
    'stripe',
    mentorId,
    req.user as IUser
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Mentor session purchase initiated — redirect to payment URL',
    data: result,
  });
});

const getMyBookedSessions = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await MentorsService.getMyBookedSessions(
    studentId,
    page,
    limit
  );

  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'My booked sessions fetched successfully',
    data: result,
  });
});

export const MentorsController = {
  getMentors,
  getBookSessionAgain,
  getRecommendedMentors,
  getTopMentors,
  getMentorDetails,
  submitReview,
  bookSession,
  getMyBookedSessions,
};
