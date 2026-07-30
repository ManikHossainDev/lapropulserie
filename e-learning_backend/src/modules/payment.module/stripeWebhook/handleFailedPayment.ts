import Stripe from 'stripe';
import { UserSubscriptionService } from '../userSubscription/userSubscription.service';

const userSubscriptionService = new UserSubscriptionService();

export const handleFailedPayment = async (
  payload: Stripe.Invoice | Stripe.Checkout.Session | any,
) => {
  if (payload?.object === 'invoice' || payload?.subscription) {
    return userSubscriptionService.syncPaymentFailed(payload as Stripe.Invoice);
  }

  return null;
};
