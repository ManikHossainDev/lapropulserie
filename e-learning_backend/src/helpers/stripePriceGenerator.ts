import Stripe from 'stripe';
import stripe from '../config/paymentGateways/stripe.config';

export async function generateStripePriceId(
  name: string,
  price: number,
  currency: string = 'usd',
  isFree: boolean = false
): Promise<string | null> {
  if (isFree || price === 0) {
    return null;
  }

  try {
    const product = await stripe.products.create({
      name: name,
      description: `${name} - ${isFree ? 'Free' : 'Regular'} capsule/journey`,
    });

    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency: currency.toLowerCase(),
      recurring: undefined,
      product: product.id,
    });

    return stripePrice.id;
  } catch (error) {
    console.error('Failed to create stripe price:', error);
    return null;
  }
}

export async function updateStripePriceId(
  existingPriceId: string | null | undefined,
  name: string,
  price: number,
  currency: string = 'usd',
  isFree: boolean = false
): Promise<string | null> {
  if (isFree || price === 0) {
    return null;
  }

  if (existingPriceId) {
    try {
      await stripe.prices.update(existingPriceId, {
        active: false,
      });
    } catch (error) {
      console.error('Failed to deactivate old stripe price:', error);
    }
  }

  return generateStripePriceId(name, price, currency, isFree);
}