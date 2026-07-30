import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
import { config } from '../../config';
import { emitEmailJob } from '../../helpers/emailEventEmitter';
import path from 'path';

type RecommendFriendInput = {
  friendName: string;
  friendEmail: string;
  senderName?: string;
};

const renderTemplate = async (templateName: string, data: Record<string, unknown>) => {
  const fs = await import('fs');
  const ejs = await import('ejs');
  const templatePath = path.join(__dirname, '..', '..', 'views', 'email', `${templateName}.ejs`);
  const template = fs.readFileSync(templatePath, 'utf-8');
  return ejs.render(template, { ...data, appName: config.app.name });
};

export const sendRecommendFriendInvite = async (input: RecommendFriendInput) => {
  const friendName = input.friendName.trim();
  const friendEmail = input.friendEmail.trim().toLowerCase();
  const senderName = (input.senderName || '').trim() || 'Un ami';

  if (!friendEmail || !friendName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Friend name and email are required');
  }

  const clientBase = (config.client.url || 'http://localhost:8002').replace(/\/$/, '');
  const bilanUrl = `${clientBase}/signup?role=student&ref=friend`;

  const subject = `${senderName} t’invite à faire ton bilan gratuit — La Propulserie`;
  const html = await renderTemplate('recommend-friend', {
    friendName,
    senderName,
    bilanUrl,
  });

  emitEmailJob({ to: friendEmail, subject, html });

  return {
    sentTo: friendEmail,
    bilanUrl,
  };
};
