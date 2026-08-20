import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/paymentGateways/stripe.config';
import { config } from '../../../config';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import ApiError from '../../../errors/ApiError';
import { TRole } from '../../../middlewares/roles';
import { User } from '../../user.module/user/user.model';
import { SubscriptionPlan } from '../subscriptionPlan/subscriptionPlan.model';
import { TSubscriptionPlanStatus } from '../subscriptionPlan/subscriptionPlan.constant';
import { UserSubscription } from './userSubscription.model';
import { TUserSubscriptionStatus } from './userSubscription.constant';

export class UserSubscriptionService {
  async getOrCreateStripeCustomer(userId: string) {
    const user = await User.findById(userId).select(
      'email name role stripeCustomerId hasUsedFreeTrial',
    );

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
    }

    if (user.role !== TRole.mentor) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Only mentors can purchase mentor subscriptions.',
      );
    }

    if (user.stripeCustomerId) {
      return { user, customerId: user.stripeCustomerId };
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return { user, customerId: customer.id };
  }

  async createCheckoutSession(userId: string, subscriptionPlanId: string) {
    const plan = await SubscriptionPlan.findOne({
      _id: subscriptionPlanId,
      isDeleted: false,
      status: TSubscriptionPlanStatus.active,
    });

    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription plan not found.');
    }

    if (!plan.stripePriceId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Stripe price is not configured for this plan yet.',
      );
    }

    const existingSubscription = await UserSubscription.findOne({
      userId,
      isDeleted: false,
      status: {
        $in: [
          TUserSubscriptionStatus.pending,
          TUserSubscriptionStatus.trialing,
          TUserSubscriptionStatus.active,
        ],
      },
    }).sort({ createdAt: -1 });

    if (existingSubscription) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You already have an active or pending mentor subscription.',
      );
    }

    const { user, customerId } = await this.getOrCreateStripeCustomer(userId);

    const subscription = await UserSubscription.create({
      userId: user._id,
      subscriptionPlanId: plan._id,
      status: TUserSubscriptionStatus.pending,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      locale: 'fr',
      allow_promotion_codes: true,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url:
        config.stripe.success_url ||
        `${config.client.url}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        config.stripe.cancel_url || `${config.client.url}/payments/cancel`,
      metadata: {
        userId: user._id.toString(),
        subscriptionType: plan.name,
        subscriptionPlanId: plan._id.toString(),
        referenceId: subscription._id.toString(),
        referenceFor: TTransactionFor.UserSubscription,
        currency: plan.currency,
        amount: plan.price.toString(),
      },
      subscription_data: {
        trial_period_days: user.hasUsedFreeTrial ? undefined : plan.trialDays,
        metadata: {
          userId: user._id.toString(),
          subscriptionType: plan.name,
          subscriptionPlanId: plan._id.toString(),
          referenceId: subscription._id.toString(),
          referenceFor: TTransactionFor.UserSubscription,
          currency: plan.currency,
          amount: plan.price.toString(),
        },
      },
    });

    subscription.stripeCheckoutSessionId = session.id;
    subscription.stripeCustomerId = customerId;
    await subscription.save();

    return {
      subscription: subscription.toJSON(),
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async getMySubscription(userId: string) {
    const subscription = await UserSubscription.findOne({
      userId,
      isDeleted: false,
    })
      .populate('subscriptionPlanId')
      .sort({ createdAt: -1 });

    return subscription ? subscription.toJSON() : null;
  }

  async getAdminList(query: any) {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.status) {
      filter.status = query.status;
    }

    const limit = Number(query.limit || 10);
    const page = Number(query.page || 1);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || '-createdAt';

    const [totalResults, results] = await Promise.all([
      UserSubscription.countDocuments(filter),
      UserSubscription.find(filter)
        .populate(
          'userId',
          'name email role profileImage subscriptionType stripeCustomerId',
        )
        .populate(
          'subscriptionPlanId',
          'name code billingPeriod price currency trialDays status',
        )
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
    ]);

    const subscriptions = {
      results: results.map((sub: any) => ({
        _id: sub._id,
        user: {
          _id: sub.userId?._id,
          name: sub.userId?.name,
          email: sub.userId?.email,
          avatar: sub.userId?.profileImage?.imageUrl || null,
        },
        plan: sub.subscriptionPlanId
          ? {
              _id: sub.subscriptionPlanId._id,
              name: sub.subscriptionPlanId.name,
              price: sub.subscriptionPlanId.price,
              billingPeriod: sub.subscriptionPlanId.billingPeriod,
            }
          : null,
        status: sub.status,
        nextBilling: sub.currentPeriodEnd || null,
        lastBilling: sub.currentPeriodStart || null,
        trialStart: sub.trialStart,
        trialEnd: sub.trialEnd,
        transactionId: sub.latestInvoiceId || null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        createdAt: sub.createdAt,
      })),
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit) || 1,
      totalResults,
    };

    if (!query.search) {
      return subscriptions;
    }

    const regex = new RegExp(query.search, 'i');
    const filteredResults = subscriptions.results.filter((item: any) => {
      return regex.test(item.user?.name || '') || regex.test(item.user?.email || '');
    });

    return {
      ...subscriptions,
      results: filteredResults,
      totalResults: filteredResults.length,
      totalPages: Math.ceil(filteredResults.length / subscriptions.limit) || 1,
    };
  }

  async getById(id: string) {
    const subscription = await UserSubscription.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate('userId', 'name email role profileImage subscriptionType')
      .populate('subscriptionPlanId');

    if (!subscription) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User subscription not found.');
    }

    return subscription.toJSON();
  }

  async cancelMySubscription(userId: string, subscriptionId: string) {
    const subscription = await UserSubscription.findOne({
      _id: subscriptionId,
      userId,
      isDeleted: false,
    });

    if (!subscription) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User subscription not found.');
    }

    if (
      ![
        TUserSubscriptionStatus.trialing,
        TUserSubscriptionStatus.active,
      ].includes(subscription.status)
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only active or trialing subscriptions can be cancelled.',
      );
    }

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    return subscription.toJSON();
  }

  async syncStripeSubscriptionDates(subscription: Stripe.Subscription) {
    const referenceId = subscription.metadata?.referenceId;
    if (!referenceId) return null;

    const userSubscription = await UserSubscription.findById(referenceId);
    if (!userSubscription) return null;

    userSubscription.stripeSubscriptionId = subscription.id;
    userSubscription.stripeCustomerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || null;
    userSubscription.trialStart = subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null;
    userSubscription.trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;
    const subscriptionPeriods = subscription as Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    };
    userSubscription.currentPeriodStart =
      subscriptionPeriods.current_period_start
        ? new Date(subscriptionPeriods.current_period_start * 1000)
        : null;
    userSubscription.currentPeriodEnd = subscriptionPeriods.current_period_end
      ? new Date(subscriptionPeriods.current_period_end * 1000)
      : null;
    userSubscription.status =
      subscription.status === 'trialing'
        ? TUserSubscriptionStatus.trialing
        : TUserSubscriptionStatus.pending;
    userSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    await userSubscription.save();

    return userSubscription;
  }

  async syncInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;
    if (!subscriptionId) return null;

    const subscription = await UserSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      isDeleted: false,
    });
    if (!subscription) return null;

    subscription.status = TUserSubscriptionStatus.active;
    subscription.latestInvoiceId = invoice.id;
    subscription.stripePaymentIntentId =
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || null;

    const period = invoice.lines?.data?.[0]?.period;
    if (period) {
      subscription.currentPeriodStart = new Date(period.start * 1000);
      subscription.currentPeriodEnd = new Date(period.end * 1000);
    }
    await subscription.save();

    const plan = await SubscriptionPlan.findById(
      subscription.subscriptionPlanId,
    ).select('name');
    const user = await User.findById(subscription.userId);
    if (user && plan) {
      user.subscriptionType = plan.name;
      user.hasUsedFreeTrial = true;
      if (subscription.stripeCustomerId) {
        user.stripeCustomerId = subscription.stripeCustomerId;
      }
      await user.save();
    }

    return subscription;
  }

  async syncPaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;
    if (!subscriptionId) return null;

    const subscription = await UserSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      isDeleted: false,
    });
    if (!subscription) return null;

    subscription.status = TUserSubscriptionStatus.suspended;
    subscription.latestInvoiceId = invoice.id;
    await subscription.save();

    return subscription;
  }

  async syncSubscriptionCancelled(subscriptionPayload: Stripe.Subscription) {
    const subscription = await UserSubscription.findOne({
      stripeSubscriptionId: subscriptionPayload.id,
      isDeleted: false,
    });
    if (!subscription) return null;

    subscription.status = TUserSubscriptionStatus.cancelled;
    subscription.cancelledAt = new Date();
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user) {
      user.subscriptionType = 'none';
      await user.save();
    }

    return subscription;
  }
}
