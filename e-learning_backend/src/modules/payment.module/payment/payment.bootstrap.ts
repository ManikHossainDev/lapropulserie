import { PaymentService } from './payment.service';
import { StripeGateway } from './gateways/stripe/stripe.gateway';
import { JourneyPurchaseStrategy } from '../../journey.module/purchased-journey/journey-purchase-strategy';
import { IndividualCapsulePurchaseStrategy } from '../../individualCapsule.module/purchased-individual-capsule/individualCapsulePurchaseStrategy';

const paymentService = new PaymentService();

paymentService.registerStrategy('Journey', new JourneyPurchaseStrategy());
paymentService.registerStrategy('IndividualCapsule', new IndividualCapsulePurchaseStrategy());
paymentService.registerGateway('stripe', new StripeGateway());

export { paymentService };
