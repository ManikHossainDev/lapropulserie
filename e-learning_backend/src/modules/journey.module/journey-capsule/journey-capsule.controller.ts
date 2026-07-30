import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { JourneyCapsule } from './journey-capsule.model';
import { IJourneyCapsule } from './journey-capsule.interface';
import { JourneyCapsuleService } from './journey-capsule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import omit from '../../../shared/omit';
import {
  enqueueVideoProcessingJob,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';

export class JourneyCapsuleController extends GenericController<
  typeof JourneyCapsule,
  IJourneyCapsule
> {
  journeyCapsuleService = new JourneyCapsuleService();

  constructor() {
    super(new JourneyCapsuleService(), 'JourneyCapsule');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data: any = { ...req.body };

    // Link existing individual capsules to journey (new flow)
    const capsuleIds: string[] = data.individualCapsuleIds?.length
      ? data.individualCapsuleIds
      : data.individualCapsuleId
        ? [data.individualCapsuleId]
        : [];

    if (capsuleIds.length) {
      const result = await this.journeyCapsuleService.linkIndividualCapsules(
        data.journeyId,
        capsuleIds,
        data.adminId,
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Individual capsule(s) linked to journey successfully',
        success: true,
      });
      return;
    }

    const introVideoToken = (data.introduction?.__videoUploadTokens as VideoUploadTokenMap | undefined)?.introVideo;
    if (data.introduction) {
      delete data.introduction.__videoUploadTokens;
    }

    data.capsuleNumber = await JourneyCapsule.countDocuments({ journeyId: data.journeyId }) + 1;
    const result = await this.service.create(data);

    if (introVideoToken && req.stagedVideoUploads && (result as any)?._id) {
      const stagedUpload = req.stagedVideoUploads[introVideoToken];
      if (stagedUpload) {
        await enqueueVideoProcessingJob(stagedUpload, {
          targetModel: 'JourneyCapsule',
          targetId: (result as any)._id.toString(),
          fieldPath: 'introduction.introVideo',
        });
      }
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getAvailableIndividualCapsules = catchAsync(async (req: Request, res: Response) => {
    const journeyId = req.query.journeyId as string;
    if (!journeyId) {
      sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'journeyId query parameter is required',
        success: false,
      });
      return;
    }

    const result = await this.journeyCapsuleService.getAvailableIndividualCapsules(journeyId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Available individual capsules retrieved successfully',
      success: true,
    });
  });

  updateCapsuleOrder = catchAsync(async (req: Request, res: Response) => {
    const { journeyId, capsules } = req.body;
    const result = await this.journeyCapsuleService.updateCapsuleOrder(journeyId, capsules);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Capsule order updated successfully',
      success: true,
    });
  });

  createWithModulesAndLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyCapsuleService.createWithModulesAndLessons(
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyCapsule with modules and lessons created successfully',
      success: true,
    });
  });

  updateWithModulesAndLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyCapsuleService.updateWithModulesAndLessons(
      req.params.id as string,
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyCapsule with modules and lessons updated successfully',
      success: true,
    });
  });

  updateById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data: any = { ...req.body };
    const introVideoToken = (data.introduction?.__videoUploadTokens as VideoUploadTokenMap | undefined)?.introVideo;

    if (data.introduction) {
      delete data.introduction.__videoUploadTokens;
    }

    const updatedObject = await this.service.updateById(id, data);

    if (!updatedObject) {
      sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: `Object with ID ${id} not found`,
        success: false,
      });
      return;
    }

    if (introVideoToken && req.stagedVideoUploads) {
      const stagedUpload = req.stagedVideoUploads[introVideoToken];
      if (stagedUpload) {
        await enqueueVideoProcessingJob(stagedUpload, {
          targetModel: 'JourneyCapsule',
          targetId: id,
          fieldPath: 'introduction.introVideo',
        });
      }
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `${this.modelName} updated successfully`,
    });
  });

  getModulesAndQuestionsByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const filters = omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await this.journeyCapsuleService.getModulesAndQuestionsByCapsuleId(filters, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Modules and questions retrieved successfully',
      success: true,
    });
  });

  getFullDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyCapsuleService.getModulesAndQuestionsByCapsuleId(
      { capsuleId: req.params.id },
      {},
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result[0] || null,
      message: 'Capsule full details retrieved successfully',
      success: true,
    });
  });

  getModulesWithoutVideo = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyCapsuleService.getModulesWithoutVideo(
      req.params.id as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Modules retrieved successfully (video URL excluded)',
      success: true,
    });
  });
}
