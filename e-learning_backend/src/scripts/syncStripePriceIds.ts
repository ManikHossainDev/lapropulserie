import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Stripe from 'stripe';
import { SubscriptionPlan } from '../modules/payment.module/subscriptionPlan/subscriptionPlan.model';
import { TSubscriptionPlanBillingPeriod } from '../modules/payment.module/subscriptionPlan/subscriptionPlan.constant';
import { config } from '../config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

async function syncMissingStripePriceIds() {
  if (!config.database.mongoUrl) {
    console.error('MONGO_URI not defined in environment');
    process.exit(1);
  }

  await mongoose.connect(config.database.mongoUrl);
  console.log('Connected to MongoDB');

  const plans = await SubscriptionPlan.find({
    isDeleted: false,
    $or: [
      { stripePriceId: { $eq: null } },
      { stripePriceId: { $exists: false } },
    ],
  });

  console.log(`Found ${plans.length} plans with missing Stripe price IDs`);

  for (const plan of plans) {
    try {
      console.log(`Creating Stripe product/price for plan: ${plan.name}`);

      const product = await stripe.products.create({
        name: `${plan.name} Subscription`,
        description: `Subscription plan: ${plan.name}`,
      });

      const interval = plan.billingPeriod === TSubscriptionPlanBillingPeriod.yearly
        ? 'year'
        : plan.billingPeriod === TSubscriptionPlanBillingPeriod.quarterly
          ? 'quarter'
          : 'month';

      const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
        unit_amount: Math.round(plan.price * 100),
        currency: plan.currency.toLowerCase(),
        recurring: { interval: interval as 'day' | 'week' | 'month' | 'year' },
        product: product.id,
      };

      const stripePrice = await stripe.prices.create(priceData);

      plan.stripeProductId = product.id;
      plan.stripePriceId = stripePrice.id;
      await plan.save();

      console.log(`Updated plan ${plan.name} with Stripe product/price: ${product.id} / ${stripePrice.id}`);
    } catch (error) {
      console.error(`Failed to create Stripe product/price for plan ${plan.name}:`, error);
    }
  }

  console.log('Sync complete!');
  await mongoose.disconnect();
  process.exit(0);
}

syncMissingStripePriceIds();
