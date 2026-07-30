import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/paymentGateways/stripe.config';
import ApiError from '../../../errors/ApiError';
import { SubscriptionPlan } from './subscriptionPlan.model';
import {
  TSubscriptionPlanBillingPeriod,
  TSubscriptionPlanStatus,
} from './subscriptionPlan.constant';

export class SubscriptionPlanService {
  private async createStripeProductAndPrice(
    name: string,
    price: number,
    currency: string,
    billingPeriod: string,
  ): Promise<{ stripeProductId: string; stripePriceId: string }> {
    const product = await stripe.products.create({
      name: `${name} Subscription`,
      description: `Subscription plan: ${name}`,
    });

    const interval = billingPeriod === TSubscriptionPlanBillingPeriod.yearly
      ? 'year'
      : billingPeriod === TSubscriptionPlanBillingPeriod.quarterly
        ? 'quarter'
        : 'month';

    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      unit_amount: Math.round(price * 100),
      currency: currency.toLowerCase(),
      recurring: { interval: interval as 'day' | 'week' | 'month' | 'year' },
      product: product.id,
    };

    const stripePrice = await stripe.prices.create(priceData);

    return {
      stripeProductId: product.id,
      stripePriceId: stripePrice.id,
    };
  }

  async create(payload: any) {
    const existing = await SubscriptionPlan.findOne({
      name: payload.name,
      isDeleted: false,
    });
    if (existing) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'A subscription plan with this name already exists.',
      );
    }

    const stripeIds = await this.createStripeProductAndPrice(
      payload.name,
      payload.price,
      payload.currency || 'usd',
      payload.billingPeriod,
    );

    const plan = await SubscriptionPlan.create({
      ...payload,
      currency: (payload.currency || 'usd').toLowerCase(),
      trialDays: payload.trialDays ?? 7,
      features: payload.features || [],
      status: payload.status || TSubscriptionPlanStatus.active,
      stripeProductId: stripeIds.stripeProductId,
      stripePriceId: stripeIds.stripePriceId,
    });

    return plan.toJSON();
  }

  async getAdminList(query: any) {
    const filter: Record<string, any> = {
      isDeleted: query.includeDeleted ? { $in: [true, false] } : false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }];
    }

    return SubscriptionPlan.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy || 'sortOrder',
    });
  }

  async getActivePlans() {
    const plans = await SubscriptionPlan.find({
      isDeleted: false,
      status: TSubscriptionPlanStatus.active,
    }).sort({ sortOrder: 1, price: 1 });

    return plans.map(plan => plan.toJSON());
  }

  async getById(id: string) {
    const plan = await SubscriptionPlan.findOne({ _id: id, isDeleted: false });
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription plan not found.');
    }

    return plan.toJSON();
  }

  async update(id: string, payload: any) {
    const plan = await SubscriptionPlan.findOne({ _id: id, isDeleted: false });
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription plan not found.');
    }

    if (payload.name && payload.name !== plan.name) {
      const exists = await SubscriptionPlan.findOne({
        name: payload.name,
        isDeleted: false,
        _id: { $ne: plan._id },
      });
      if (exists) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Another subscription plan with this name already exists.',
        );
      }
    }

    Object.assign(plan, payload);
    if (payload.currency) {
      plan.currency = payload.currency.toLowerCase();
    }
    await plan.save();
    return plan.toJSON();
  }

  async softDelete(id: string) {
    const plan = await SubscriptionPlan.findOne({ _id: id, isDeleted: false });
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription plan not found.');
    }

    plan.isDeleted = true;
    plan.status = TSubscriptionPlanStatus.inactive;
    await plan.save();
    return plan.toJSON();
  }

  async seedDefaultPlans() {
    // Drop the old 'code_1' index if it exists (leftover from previous schema)
    try {
      await SubscriptionPlan.collection.dropIndex('code_1');
    } catch (error) {
      // Index doesn't exist, ignore the error
    }

    const defaults = [
      {
        name: 'Stellar Explorer',
        description: 'Essential tools new mentors',
        billingPeriod: TSubscriptionPlanBillingPeriod.monthly,
        price: 49,
        features: [
          'Basic profile visibility',
          'Up to 3 leads per month ',
          'Standard search listing ',
          'Smart AI Matching',
        ],
        sortOrder: 1,
      },
      {
        name: 'Galactic Guide',
        description: 'For serious mentors growing their reach',
        billingPeriod: TSubscriptionPlanBillingPeriod.monthly,
        price: 49,
        mostPopular: true,
        features: [
          'Priority Profile Visibility',
          'Unlimited Leads',
          '“Verified Mentor” Badge',
          'Smart AI Matching',
        ],
        sortOrder: 2,
      },
      {
        name: 'Universal Master',
        description: 'Maximum exposure & zero fees',
        billingPeriod: TSubscriptionPlanBillingPeriod.monthly,
        price: 99,
        features: [
          'Top of Search Results',
          'Featured in Weekly Newsletter',
          'Dedicated Success Manager',
          'Smart AI Matching',
        ],
        sortOrder: 3,
      },
    ];
    for (const plan of defaults) {
      await SubscriptionPlan.updateOne(
        { name: plan.name },
        {
          $setOnInsert: {
            ...plan,
            currency: 'usd',
            trialDays: 7,
            status: TSubscriptionPlanStatus.active,
            isDeleted: false,
          },
        },
        { upsert: true },
      );
    }
  }
}
