import { Request, Response } from 'express';
import { CalendlyService } from './calendly/calendly.service';
import { User } from '../user.module/user/user.model';
import { handleInviteeCreated } from './webhookHandlers/handleInviteeCreated';
import { handleInviteeCanceled } from './webhookHandlers/handleMeetingCanceled';
import sendResponse from '../../shared/sendResponse';

const calendlyService = new CalendlyService();

const extractCalendlyUuid = (uri?: string | null) => uri?.split('/').pop() || null;

export const calendlyOAuthCallbackHandlerV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, state } = req.query;

    if (!state) {
      throw new Error('Invalid state parameter');
    }

    const stateData = JSON.parse(
      Buffer.from(state as string, 'base64').toString('utf-8'),
    );

    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('State expired');
    }

    const userId = stateData.userId;
    const tokenData = await calendlyService.getAccessToken(code as string);
    const userDetails = await calendlyService.getUserDetails(
      tokenData.access_token,
    );

    let webhook = null;
    try {
      webhook = await calendlyService.createWebhookSubscription(
        tokenData.access_token,
        userDetails.uri,
      );
    } catch (err) {
      console.warn('Webhook subscription creation failed, continuing:', err);
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'calendly.userId': extractCalendlyUuid(userDetails.uri),
          'calendly.userUri': userDetails.uri,
          'calendly.organizationUri': userDetails.current_organization,
          'calendly.encryptedAccessToken': tokenData.access_token,
          'calendly.refreshToken': tokenData.refresh_token,
          'calendly.expiresAt': new Date(
            Date.now() + tokenData.expires_in * 1000,
          ),
          'calendly.webhookSubscriptionId': webhook
            ? extractCalendlyUuid(webhook.uri)
            : null,
          'calendly.profileUrl': userDetails.scheduling_url,
          'calendly.connectedAt': new Date(),
          'calendly.disconnectedAt': null,
        },
      },
      { new: true, runValidators: true },
    );

    const homePage =
      process.env.FRONTEND_URL || 'https://wwhf5s4x-8080.asse.devtunnels.ms';
    res.redirect(
      `${homePage}?calendly=connected&name=${encodeURIComponent(
        userDetails.name,
      )}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Calendly OAuth error:', error);
    const homePage =
      process.env.FRONTEND_URL ||
      'https://wwhf5s4x-8080.asse.devtunnels.ms/errors';
    res.redirect(
      `${homePage}?calendly=error&message=${encodeURIComponent(message)}`,
    );
  }
};

export const calendlyWebHookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  sendResponse(res, {
    code: 200,
    message: 'Calendly webhook received successfully.',
    data: { received: true },
  });

  try {
    const { event, payload } = req.body;
    const calendlyUserId = extractCalendlyUuid(payload?.event?.user);

    if (!calendlyUserId) {
      console.warn('Calendly webhook received without a user identifier.');
      return;
    }

    const user = await User.findOne({
      'calendly.userId': calendlyUserId,
      isDeleted: false,
      'calendly.disconnectedAt': null,
    });

    if (!user) {
      console.warn(`Webhook for unknown Calendly user: ${calendlyUserId}`);
      return;
    }

    if (event === 'invitee.created') {
      await handleInviteeCreated(user, payload);
      return;
    }

    if (event === 'invitee.canceled') {
      await handleInviteeCanceled(payload);
      return;
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
};
