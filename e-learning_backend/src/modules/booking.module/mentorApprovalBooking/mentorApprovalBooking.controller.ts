import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MentorApprovalBookingService } from './mentorApprovalBooking.service';

const mentorApprovalBookingService = new MentorApprovalBookingService();

export class MentorApprovalBookingController {
  getAdminList = catchAsync(async (req: Request, res: Response) => {
    const result = await mentorApprovalBookingService.getAdminList(req.query, {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor approval bookings retrieved successfully',
      success: true,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const result = await mentorApprovalBookingService.getById(
      req.params.id as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor approval booking retrieved successfully',
      success: true,
    });
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await mentorApprovalBookingService.updateStatus(
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor approval booking updated successfully',
      success: true,
    });
  });
}
