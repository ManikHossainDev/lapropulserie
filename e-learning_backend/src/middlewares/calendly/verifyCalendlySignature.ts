import crypto from 'crypto';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import { sendErrorResponse } from '../../shared/sendResponse';

dotenv.config();

// MUST use raw body parser before this middleware!
export const verifyCalendlySignature = (req: any, res: any, next: any) => {
  const signature = req.headers['x-calendly-signature'];
  const payload = req.rawBody;

  // Validation requests may not include a signature.
  if (!signature) {
    console.log('Calendly validation request (no signature)');
    return next();
  }

  if (!payload) {
    return sendErrorResponse(res, {
      code: 401,
      message: 'Missing signature or payload',
      errors: [{ path: 'x-calendly-signature', message: 'Missing signature or payload' }],
    });
  }

  const expectedSig = crypto
    .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '')
    .update(payload)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature as string),
    Buffer.from(expectedSig),
  );

  if (!isValid) {
    console.error('Calendly webhook signature verification failed');
    return sendErrorResponse(res, {
      code: 401,
      message: 'Invalid signature',
      errors: [{ path: 'x-calendly-signature', message: 'Invalid signature' }],
    });
  }

  try {
    req.body = JSON.parse(payload);
    return next();
  } catch (error) {
    return sendErrorResponse(res, {
      code: 400,
      message: 'Invalid JSON payload',
      errors: [{ path: 'body', message: 'Invalid JSON payload' }],
    });
  }
};
