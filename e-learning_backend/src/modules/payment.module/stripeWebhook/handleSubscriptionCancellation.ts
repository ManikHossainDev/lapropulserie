import Stripe from 'stripe';
import { UserSubscriptionService } from '../userSubscription/userSubscription.service';

const userSubscriptionService = new UserSubscriptionService();

export const handleSubscriptionCancellation = async (
  subscription: Stripe.Subscription,
) => {
  return userSubscriptionService.syncSubscriptionCancelled(subscription);
};
