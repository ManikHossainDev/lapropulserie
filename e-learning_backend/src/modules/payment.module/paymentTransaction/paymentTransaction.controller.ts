import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/paymentGateways/stripe.config';
import { config } from '../../../config';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { GenericController } from '../../_generic-module/generic.controller';
import { IPaymentTransaction } from './paymentTransaction.interface';
import { PaymentTransaction } from './paymentTransaction.model';
import { PaymentTransactionService } from './paymentTransaction.service';

export class PaymentTransactionController extends GenericController<
  typeof PaymentTransaction,
  IPaymentTransaction
> {
  paymentTransactionService = new PaymentTransactionService();
  private stripe: Stripe;

  constructor() {
    super(new PaymentTransactionService(), 'paymentTransaction');
    this.stripe = stripe;
  }

  successPage = catchAsync(async (req: Request, res: Response) => {
    const { session_id } = req.query;

    if (!session_id || Array.isArray(session_id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Session ID is required');
    }

    const session = await this.stripe.checkout.sessions.retrieve(session_id as string);

    res.render('success.ejs', {
      frontEndHomePageUrl: config.client.url,
      data: {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase(),
        subscriptionId:
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
        planNickname: session.metadata?.planNickname || 'N/A',
        subscriptionType: session.metadata?.subscriptionType || 'N/A',
        customerEmail: session.customer_details?.email || 'N/A',
        customerName: session.customer_details?.name || 'N/A',
      },
    });
  });

  cancelPage = catchAsync(async (_req: Request, res: Response) => {
    res.render('cancel.ejs', { frontEndHomePageUrl: config.client.url });
  });

  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    const filters = omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    options.sortBy = '-createdAt';

    const result = await this.service.getAllWithPagination(
      filters,
      options,
      [{ path: 'userId', select: 'name profileImage role' }],
      '-isDeleted -createdAt -updatedAt -__v -gatewayResponse',
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  getAllWithPaginationForDev = catchAsync(async (req: Request, res: Response) => {
    const filters = omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await this.service.getAllWithPagination(
      filters,
      options,
      [],
      '-isDeleted -createdAt -updatedAt -__v',
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  getEarningsOverview = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.paymentTransactionService.getEarningsOverview();

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Earnings overview retrieved successfully',
      success: true,
    });
  });
}
