import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MentorProfile } from './mentorProfile.model';
import { IMentorProfile } from './mentorProfile.interface';
import { MentorProfileService } from './mentorProfile.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { processFilesV2 } from '../../../helpers/processFilesToUpload';
import { TFolderName } from '../../../enums/folderNames';
import { User } from '../../user.module/user/user.model';

export class MentorProfileController extends GenericController<
  typeof MentorProfile,
  IMentorProfile
> {
  mentorProfileService = new MentorProfileService();

  constructor() {
    super(new MentorProfileService(), 'MentorProfile');
  }

  updateMentorProfileWithFormData = catchAsync(async (req: Request, res: Response) => {
    const mentorId = req.user.userId;

    let avatarUrl: string | null = null;

    // Must use V2 (URL strings). V1 processFiles returns Attachment ObjectIds — not usable as img src.
    if (req.files && (req.files as any).avatarUrl) {
      const uploaded = await processFilesV2(
        (req.files as any).avatarUrl,
        TFolderName.profile,
      );
      avatarUrl = uploaded[0] || null;
    }

    const data = req.body.data ? JSON.parse(req.body.data) : req.body;

    if (avatarUrl) {
      data.avatarUrl = avatarUrl;
    }

    const result = await this.mentorProfileService.updateMentorProfileV2(
      data,
      mentorId,
    );

    if (avatarUrl) {
      // User schema: profileImage.imageUrl
      await User.findByIdAndUpdate(mentorId, {
        profileImage: { imageUrl: avatarUrl },
      });
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });

  // we create mentor profile while mentor register .. now we just update mentor profile information
  updateMentorProfile = catchAsync(async (req: Request, res: Response) => {
    const data:any = req.body;

    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.updateMentorProfileV2(data, mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });

  getMentorOnboardingStatus = catchAsync(async (req: Request, res: Response) => {
    const mentorId = req.user.userId;
    const result =
      await this.mentorProfileService.getMentorOnboardingStatus(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor onboarding status retrieved successfully.`,
      success: true,
    });
  });

  requestForAdminApproval = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.changeStatusOfHaveAdminApproval( mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });


  checkStatusOfHaveAdminApproval = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.checkStatusOfHaveAdminApproval( mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `haveAdminApproval and isLive status retrived successfully.`,
      success: true,
    });
  });

  mentorProfileInfoWithReviews = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.params.mentorId as string;

    // const result = await this.mentorProfileService.mentorProfileInfoWithReviews(mentorId);

    const result = await this.mentorProfileService.mentorProfileInfoWithReviewsV2(mentorId);

    


    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor details with reviews retrived successfully.`,
      success: true,
    });
  });

  getAdminMentorReviewList = catchAsync(async (req: Request, res: Response) => {
    const filters = {
      ...req.query,
      isLive:
        req.query.isLive === undefined
          ? undefined
          : req.query.isLive === 'true',
    };
    const options = {
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await this.mentorProfileService.getAdminMentorReviewList(
      filters,
      options,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor review list retrieved successfully.`,
      success: true,
    });
  });

  getAdminMentorReviewDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await this.mentorProfileService.getAdminMentorReviewDetails(
      req.params.id as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor review details retrieved successfully.`,
      success: true,
    });
  });

  updateAdminApprovalStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await this.mentorProfileService.updateAdminApprovalStatus(
      req.params.id as string,
      req.body.approvalStatus,
      req.body,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor approval status updated successfully.`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
