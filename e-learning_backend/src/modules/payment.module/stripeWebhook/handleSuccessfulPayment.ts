import Stripe from 'stripe';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import { TPaymentGateway, TPaymentStatus } from '../paymentTransaction/paymentTransaction.constant';
import { PaymentTransaction } from '../paymentTransaction/paymentTransaction.model';
import stripe from '../../../config/paymentGateways/stripe.config';
import { UserSubscriptionService } from '../userSubscription/userSubscription.service';

const userSubscriptionService = new UserSubscriptionService();

export const handleSuccessfulPayment = async (invoice: Stripe.Invoice) => {
  const paidSubscription = await userSubscriptionService.syncInvoicePaid(invoice);

  if (!paidSubscription) {
    return null;
  }

  const plan = await (paidSubscription as any).populate?.('subscriptionPlanId');
  const subscriptionDetails = await stripe.subscriptions.retrieve(
    paidSubscription.stripeSubscriptionId as string,
  );

  return PaymentTransaction.create({
    userId: paidSubscription.userId,
    referenceFor: TTransactionFor.UserSubscription,
    referenceId: paidSubscription._id,
    paymentGateway: TPaymentGateway.stripe,
    transactionId: invoice.id,
    paymentIntent:
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || null,
    amount:
      typeof invoice.amount_paid === 'number'
        ? invoice.amount_paid / 100
        : 0,
    currency: (invoice.currency || plan?.subscriptionPlanId?.currency || 'usd').toLowerCase(),
    paymentStatus: TPaymentStatus.completed,
    gatewayResponse: {
      invoiceId: invoice.id,
      subscriptionId: subscriptionDetails.id,
      billingReason: invoice.billing_reason,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
    },
  });
};
