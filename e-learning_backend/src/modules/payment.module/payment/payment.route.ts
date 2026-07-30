/**
 * Payment Routes Module
 * 
 * This module defines payment-related endpoints including:
 * - Payment success page
 * - Payment cancel page
 * - Payment transaction details
 * 
 * @module PaymentRoute
 */

import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

const controller = new PaymentController();

/**
 * @route GET /payments/success
 * @description Handle successful payment redirect from Stripe
 * @access Public (redirect from Stripe)
 * @query {string} session_id - Stripe checkout session ID
 * @returns {Object|HTML} Payment success details
 */
router.route('/success').get(controller.paymentSuccess);

/**
 * @route GET /payments/cancel
 * @description Handle canceled/failed payment redirect from Stripe
 * @access Public (redirect from Stripe)
 * @query {string} session_id - Stripe checkout session ID (optional)
 * @returns {Object|HTML} Payment cancel details
 */
router.route('/cancel').get(controller.paymentCancel);

/**
 * @route GET /payments/details/:transactionId
 * @description Get payment transaction details
 * @access Private (Authenticated users)
 * @param {string} transactionId - Transaction ID
 * @returns {Object} Payment transaction details
 */
router.route('/details/:transactionId').get(
  auth(TRole.student, TRole.admin),
  controller.getPaymentDetails
);

export const PaymentRoute = router;
