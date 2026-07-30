import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import { chatWithLuna } from './luna.service';
import { IndividualCapsule } from '../individualCapsule.module/individual-capsule/individual-capsule.model';

export const lunaChat = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.userId as string;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }

  const { capsuleId, step, message } = req.body;

  const capsule = await IndividualCapsule.findById(capsuleId)
    .select('title introduction inspiration reflection science')
    .lean();

  if (!capsule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
  }

  const stepLabels = [
    'Introduction',
    'Inspiration',
    'Réflexion',
    'Exercices',
    'Science',
    'Rapport Marii',
  ];

  const stepNum = Number(step) || 1;
  let capsuleContext = '';
  if (stepNum === 1) capsuleContext = capsule.introduction?.text || '';
  if (stepNum === 2) capsuleContext = capsule.inspiration?.text || '';
  if (stepNum === 3) {
    capsuleContext = (capsule.reflection?.questions || [])
      .map((q) => q.question)
      .join('; ');
  }
  if (stepNum === 5) capsuleContext = capsule.science?.text || '';

  const result = await chatWithLuna({
    message: message || '',
    step: stepNum,
    stepLabel: stepLabels[stepNum - 1] || 'Parcours',
    capsuleTitle: capsule.title,
    capsuleContext,
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Luna reply',
    success: true,
  });
});
