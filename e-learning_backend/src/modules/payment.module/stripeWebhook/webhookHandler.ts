//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import Stripe from 'stripe';
import { config } from '../../../config';
import stripe from '../../../config/paymentGateways/stripe.config';
import { handlePaymentSucceeded } from './handlePaymentSucceeded';
import { handleFailedPayment } from './handleFailedPayment';
import { handleSubscriptionCancellation } from './handleSubscriptionCancellation';
import { handleSuccessfulPayment } from './handleSuccessfulPayment';
import { handleSubscriptionDates } from './handleSubscriptionDates';
import sendResponse, { sendErrorResponse } from '../../../shared/sendResponse';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('Webhook received');
  const signature = req.headers['stripe-signature'];
  const webhookSecret = config.stripe.webhookSecret;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not set');
    sendErrorResponse(res, {
      code: 500,
      message: 'Webhook secret not configured',
      errors: [{ path: 'stripe.webhookSecret', message: 'Webhook secret not configured' }],
    });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      webhookSecret,
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    sendErrorResponse(res, {
      code: 400,
      message: `Webhook Error: ${error.message}`,
      errors: [{ path: 'stripe-signature', message: error.message }],
    });
    return;
  }

  console.log('event.type', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
      case 'checkout.session.expired':
        await handleFailedPayment(event.data.object);
        break;
      case 'transfer.created':
        break;
      case 'invoice.payment_succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionDates(event.data.object);
        break;
      case 'customer.subscription.trial_will_end':
        break;
      case 'invoice.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      case 'customer.subscription.updated':
        break;
      default:
        console.log('Unhandled event type:', event.type);
        break;
    }

    sendResponse(res, {
      code: 200,
      message: 'Stripe webhook received successfully.',
      data: { received: true },
    });
  } catch (error: any) {
    console.error('Error handling the event:', error);
    sendErrorResponse(res, {
      code: 500,
      message: `Internal Server Error: ${error.message}`,
      errors: [{ path: 'stripeWebhook', message: error.message }],
    });
  }
};

export default webhookHandler;
