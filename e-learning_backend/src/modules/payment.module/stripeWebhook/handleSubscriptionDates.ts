import Stripe from 'stripe';
import { UserSubscriptionService } from '../userSubscription/userSubscription.service';

const userSubscriptionService = new UserSubscriptionService();

export const handleSubscriptionDates = async (
  subscription: Stripe.Subscription,
) => {
  return userSubscriptionService.syncStripeSubscriptionDates(subscription);
};
