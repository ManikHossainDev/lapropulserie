import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { JourneyProgressTracker } from './journey-progress-tracker.model';
import { IJourneyProgressTracker } from './journey-progress-tracker.interface';
import { JourneyProgressTrackerService } from './journey-progress-tracker.service';
import catchAsync from '../../../shared/catchAsync';
import ApiError from '../../../errors/ApiError';
import sendResponse from '../../../shared/sendResponse';
import { TCurrentSection, TTrackerStatus } from './journey-progress-tracker.constant';

export class JourneyProgressTrackerController extends GenericController<
  typeof JourneyProgressTracker,
  IJourneyProgressTracker
> {
  journeyProgressTrackerService = new JourneyProgressTrackerService();

  constructor() {
    super(new JourneyProgressTrackerService(), 'JourneyProgressTracker');
  }

  initializeTracker = catchAsync(async (req: Request, res: Response) => {
    const { journeyId, capsuleId } = req.body;
    const studentId = req.user.userId;

    const tracker = await this.journeyProgressTrackerService.initializeTracker(
      studentId,
      journeyId,
      capsuleId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: tracker,
      message: 'Tracker initialized successfully',
    });
  });

  updateSectionStatus = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId, section, status } = req.body;
    const studentId = req.user.userId;

    const tracker = await this.journeyProgressTrackerService.updateSectionStatus(
      studentId,
      capsuleId,
      section as TCurrentSection,
      status as TTrackerStatus,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: tracker,
      message: 'Section status updated successfully',
    });
  });

  updateModuleProgress = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId, moduleId, status, lastWatchTime } = req.body;
    const studentId = req.user.userId;

    const tracker = await this.journeyProgressTrackerService.updateModuleProgress(
      studentId,
      capsuleId,
      moduleId,
      status as TTrackerStatus,
      lastWatchTime,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: tracker,
      message: 'Module progress updated successfully',
    });
  });

  updateLastAccessed = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId, itemType, itemId, lastWatchTime } = req.body;
    const studentId = req.user.userId;

    const tracker = await this.journeyProgressTrackerService.updateLastAccessed(
      studentId,
      capsuleId,
      itemType,
      itemId,
      lastWatchTime,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: tracker,
      message: 'Last accessed item updated successfully',
    });
  });

  getResumePoint = catchAsync(async (req: Request, res: Response) => {
    const journeyId = Array.isArray(req.params.journeyId) ? req.params.journeyId[0] : req.params.journeyId;
    if (!journeyId) throw new ApiError(StatusCodes.BAD_REQUEST, 'journeyId is required');
    const studentId = req.user.userId;

    const resumeData = await this.journeyProgressTrackerService.getResumePoint(
      studentId,
      journeyId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: resumeData,
      message: 'Resume point retrieved successfully',
    });
  });

  getProgress = catchAsync(async (req: Request, res: Response) => {
    const journeyId = Array.isArray(req.params.journeyId) ? req.params.journeyId[0] : req.params.journeyId;
    if (!journeyId) throw new ApiError(StatusCodes.BAD_REQUEST, 'journeyId is required');
    const studentId = req.user.userId;

    const progressData = await this.journeyProgressTrackerService.getProgress(
      studentId,
      journeyId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: progressData,
      message: 'Progress retrieved successfully',
    });
  });
}
