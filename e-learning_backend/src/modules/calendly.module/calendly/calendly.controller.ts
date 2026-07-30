import { Buffer } from 'buffer';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { User } from '../../user.module/user/user.model';
import { CalendlyService } from './calendly.service';

export class CalendlyController {
  calendlyService = new CalendlyService();

  redirectToCalendlyAuth = catchAsync(async (req: Request, res: Response) => {
    const state = Buffer.from(
      JSON.stringify({
        userId: req.user.userId,
        timestamp: Date.now(),
      }),
    ).toString('base64');

    const authUrl = this.calendlyService.getAuthUrl(state);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: authUrl,
      message: 'Calendly authorization URL retrieved successfully',
      success: true,
    });
  });

  disconnectCalendly = catchAsync(async (req: Request, res: Response) => {
    const user = (await User.findById(req.user.userId)
      .select('calendly')
      .lean()) as { calendly?: { organizationUri?: string } } | null;
    const organizationUri =
      (req.query.organization as string | undefined) ||
      user?.calendly?.organizationUri;

    if (!organizationUri) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Calendly is not connected');
    }

    const accessToken = await this.calendlyService.getValidAccessToken(
      req.user.userId,
    );

    await this.calendlyService.deleteAllWebhooks(accessToken, organizationUri);

    await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        'calendly.disconnectedAt': new Date(),
      },
      $unset: {
        'calendly.userId': '',
        'calendly.userUri': '',
        'calendly.organizationUri': '',
        'calendly.encryptedAccessToken': '',
        'calendly.refreshToken': '',
        'calendly.expiresAt': '',
        'calendly.webhookSubscriptionId': '',
        'calendly.profileUrl': '',
      },
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Calendly disconnected successfully',
      data: null,
    });
  });

  getScheduledEvents = catchAsync(async (req: Request, res: Response) => {
    const accessToken = await this.calendlyService.getValidAccessToken(
      req.user.userId,
    );

    const me = await axios.get('https://api.calendly.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userUri = me.data.resource.uri;
    const data = await this.calendlyService.getScheduledEvents(
      accessToken,
      userUri,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Upcoming scheduled events retrieved successfully',
      data,
    });
  });

  getEventTypes = catchAsync(async (req: Request, res: Response) => {
    const accessToken = await this.calendlyService.getValidAccessToken(
      req.user.userId,
    );

    const me = await axios.get('https://api.calendly.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userUri = me.data.resource.uri;
    const data = await this.calendlyService.getEventTypes(accessToken, userUri);

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Event types retrieved successfully',
      data,
    });
  });

  getEventInvitees = catchAsync(async (req: Request, res: Response) => {
    const user = (await User.findById(req.user.userId)
      .select('calendly')
      .lean()) as { calendly?: { encryptedAccessToken?: string } } | null;
    if (!user?.calendly?.encryptedAccessToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Calendly not connected');
    }

    const accessToken = await this.calendlyService.getValidAccessToken(
      req.user.userId,
    );

    const data = await this.calendlyService.getEventInvitees(
      accessToken,
      req.params.eventUuid as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Event invitees retrieved successfully',
      data,
    });
  });
}
