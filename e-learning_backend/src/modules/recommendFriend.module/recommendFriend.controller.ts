import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { sendRecommendFriendInvite } from './recommendFriend.service';

export const recommendFriend = catchAsync(async (req: Request, res: Response) => {
  const result = await sendRecommendFriendInvite(req.body);

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Invitation envoyée avec succès',
    data: result,
  });
});
