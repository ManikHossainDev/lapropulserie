import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentTransaction } from '../paymentTransaction/paymentTransaction.model';
import { PurchasedIndividualCapsule } from '../../individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.model';
import { PurchasedJourney } from '../../journey.module/purchased-journey/purchased-journey.model';
import { PurchasedJourneyService } from '../../journey.module/purchased-journey/purchased-journey.service';
import ApiError from '../../../errors/ApiError';
import { TPaymentStatus } from '../paymentTransaction/paymentTransaction.constant';
import stripe from '../../../config/paymentGateways/stripe.config';
import { config } from '../../../config';
import { handlePaymentSucceeded } from '../stripeWebhook/handlePaymentSucceeded';

export class PaymentController {
  /**
   * Handle successful payment redirect
   * This endpoint is called after successful Stripe checkout
   */
   paymentSuccess = catchAsync(async (req: Request, res: Response) => {
     const { session_id } = req.query;

     if (!session_id || Array.isArray(session_id)) {
       throw new ApiError(StatusCodes.BAD_REQUEST, 'Session ID is required');
     }

     const sessionId = String(session_id);

     let transaction = await PaymentTransaction.findOne({
       transactionId: sessionId,
     }).populate('referenceId');

     // Stripe redirects here before (or without) the webhook. If the row is
     // missing, confirm the session with Stripe and fulfill as a fallback.
     if (!transaction) {
       const session = await stripe.checkout.sessions.retrieve(sessionId);
       const paid =
         session.payment_status === 'paid' || session.status === 'complete';

       if (paid) {
         await handlePaymentSucceeded(session);
         transaction = await PaymentTransaction.findOne({
           transactionId: sessionId,
         }).populate('referenceId');
       }

       if (!transaction) {
         const wantsHtml = req.accepts('html');
         if (paid && wantsHtml) {
           res.render('success', {
             data: {
               customerName: session.customer_details?.name || 'Customer',
               customerEmail: session.customer_details?.email || '',
               planNickname: session.metadata?.referenceFor || 'Payment',
               subscriptionType: 'One-time purchase',
               amountTotal: session.amount_total
                 ? session.amount_total / 100
                 : 0,
               currency: session.currency || 'eur',
               paymentStatus: session.payment_status,
               sessionId: session.id,
               subscriptionId: null,
               frontEndHomePageUrl:
                 config.client.url || process.env.CLIENT_URL || 'http://localhost:3000',
             },
           });
           return;
         }

         throw new ApiError(
           StatusCodes.NOT_FOUND,
           paid
             ? 'Payment received. Confirmation is still processing — refresh this page.'
             : 'Payment transaction not found',
         );
       }
     }

     // Get purchase details based on reference type
     let purchaseDetails: any = null;
     if (transaction.referenceId && typeof transaction.referenceId === 'object') {
       purchaseDetails = transaction.referenceId;
       
        // If this is a PurchasedJourney and counts are still zero, calculate them
        if (transaction.referenceFor === 'PurchasedJourney' && 
            purchaseDetails.totalCapsules === 0) {
          try {
            const purchasedJourneyService = new PurchasedJourneyService();
            await purchasedJourneyService.getJourneyProgress(
              purchaseDetails.journeyId.toString(),
              purchaseDetails.studentId.toString()
            );
            // Refresh the populated document to get updated counts
            const updatedPurchasedJourney = await PurchasedJourney.findById(purchaseDetails._id);
            purchaseDetails = updatedPurchasedJourney;
          } catch (error) {
            console.error('Error calculating journey progress on success page:', error);
          }
        }
     }

     const responseData = {
       transactionId: transaction.transactionId,
       amount: transaction.amount,
       currency: transaction.currency,
       paymentStatus: transaction.paymentStatus,
       referenceFor: transaction.referenceFor,
       purchaseDetails,
       message: 'Payment completed successfully',
     };

     // For browser requests, render EJS template
     if (req.accepts('html')) {
       res.render('success', {
         data: {
           customerName: 'Customer',
           customerEmail: '',
           planNickname: transaction.referenceFor,
           subscriptionType: 'One-time purchase',
           amountTotal: transaction.amount,
           currency: transaction.currency,
           paymentStatus: transaction.paymentStatus,
           sessionId: transaction.transactionId,
           subscriptionId: null,
           frontEndHomePageUrl: process.env.CLIENT_URL || 'http://localhost:3000',
         },
       });
       return;
     }

     // For API requests, return JSON
     sendResponse(res, {
       code: StatusCodes.OK,
       data: responseData,
       message: 'Payment completed successfully',
       success: true,
     });
   });

  /**
   * Handle canceled/failed payment redirect
   * This endpoint is called when user cancels payment or it fails
   */
  paymentCancel = catchAsync(async (req: Request, res: Response) => {
    const { session_id } = req.query;

    // Try to find transaction if it was created
    let transaction: any = null;
    if (session_id) {
      transaction = await PaymentTransaction.findOne({
        transactionId: session_id,
      });
    }

    const responseData = {
      transactionId: session_id || null,
      paymentStatus: transaction?.paymentStatus || 'cancelled',
      message: 'Payment was cancelled or failed',
      nextSteps: 'You can retry the purchase from your dashboard',
    };

    // For browser requests, render EJS template
    if (req.accepts('html')) {
      res.render('cancel', {
        data: {
          frontEndHomePageUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        },
      });
      return;
    }

    // For API requests, return JSON
    sendResponse(res, {
      code: StatusCodes.OK,
      data: responseData,
      message: 'Payment was cancelled or failed',
      success: false,
    });
  });

  /**
   * Get payment transaction details
   */
  getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    const transaction = await PaymentTransaction.findOne({
      transactionId,
    }).populate('referenceId');

    if (!transaction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment transaction not found');
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: transaction,
      message: 'Payment details retrieved successfully',
      success: true,
    });
  });
}
