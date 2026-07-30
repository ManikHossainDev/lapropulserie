import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { PurchasedIndividualCapsule } from './purchased-individual-capsule.model';
import { IPurchasedIndividualCapsule } from './purchased-individual-capsule.interface';
import { PurchasedIndividualCapsuleService } from './purchased-individual-capsule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { PaymentService } from '../../payment.module/payment/payment.service';
import { IndividualCapsulePurchaseStrategy } from './individualCapsulePurchaseStrategy';
import { StripeGateway } from '../../payment.module/payment/gateways/stripe/stripe.gateway';

export class PurchasedIndividualCapsuleController extends GenericController<
  typeof PurchasedIndividualCapsule,
  IPurchasedIndividualCapsule
> {
  purchasedIndividualCapsuleService = new PurchasedIndividualCapsuleService();
  paymentService = new PaymentService();

  constructor() {
    super(new PurchasedIndividualCapsuleService(), 'PurchasedIndividualCapsule');

    this.paymentService.registerStrategy('IndividualCapsule', new IndividualCapsulePurchaseStrategy());
    this.paymentService.registerGateway('stripe', new StripeGateway());
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const strategy = await this.paymentService.processPayment(
      'IndividualCapsule',
      'stripe',
      req.params.capsuleId as string,
      req.user as IUser,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: strategy,
      message: 'Capsule purchase initiated — redirect to payment URL',
      success: true,
    });
  });

  getAllWithGiftedAndCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await this.purchasedIndividualCapsuleService.getAllWithGiftedAndCategories(
      req.user as IUser,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Purchased and gifted capsules fetched successfully',
      success: true,
    });
  });

  giftCapsule = catchAsync(async (req: Request, res: Response) => {
    const { studentId, capsuleId } = req.body;

    const result = await this.purchasedIndividualCapsuleService.giftCapsule(
      studentId,
      capsuleId,
    );

    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: 'Capsule gifted to student successfully',
      success: true,
    });
  });

  /**
   * Get dynamic progress calculation for a purchased individual capsule.
   */
  getProgress = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const studentId = req.user.userId;

    const progress = await this.purchasedIndividualCapsuleService.getIndividualCapsuleProgress(
      capsuleId as string,
      studentId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: progress,
      message: 'Individual capsule progress calculated successfully',
      success: true,
    });
  });
}
