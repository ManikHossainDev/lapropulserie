import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PurchasedJourney } from './purchased-journey.model';
import { IPurchasedJourney } from './purchased-journey.interface';
import { PurchasedJourneyService } from './purchased-journey.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { PaymentService } from '../../payment.module/payment/payment.service';
import { StripeGateway } from '../../payment.module/payment/gateways/stripe/stripe.gateway';
import { JourneyPurchaseStrategy } from './journey-purchase-strategy';

export class PurchasedJourneyController extends GenericController<
  typeof PurchasedJourney,
  IPurchasedJourney
> {
  purchasedJourneyService = new PurchasedJourneyService();
  paymentService = new PaymentService();

  constructor() {
    super(new PurchasedJourneyService(), 'PurchasedJourney');
    
    this.paymentService.registerStrategy('Journey', new JourneyPurchaseStrategy());
    this.paymentService.registerGateway('stripe', new StripeGateway());
  }

  /**
   * Purchase a journey via Stripe checkout.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const strategy = await this.paymentService.processPayment(
      'Journey',
      'stripe',
      req.params.journeyId as string,
      req.user as IUser
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: strategy,
      message: `${this.modelName} created successfully — redirecting to payment URL`,
      success: true,
    });
  });

  /**
   * Get dynamic progress calculation for this student's purchased journey.
   */
  getProgress = catchAsync(async (req: Request, res: Response) => {
    const { journeyId } = req.params;
    const studentId = req.user.userId;

    const progress = await this.purchasedJourneyService.getJourneyProgress(
      journeyId as string,
      studentId as string
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: progress,
      message: 'Journey progress calculated successfully',
      success: true,
    });
  });
}
