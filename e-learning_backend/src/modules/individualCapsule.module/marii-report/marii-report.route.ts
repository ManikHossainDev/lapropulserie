import express from 'express';
import { MariiReportController } from './marii-report.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import {
  autoGenerateMariiReportValidation,
  generateExpeditionMariiValidation,
  generateMariiReportValidation,
  getExpeditionMariiValidation,
  getMariiReportByCapsuleValidation,
} from './marii-report.validation';

const router = express.Router();
const controller = new MariiReportController();

router.route('/generate').post(
  auth(TRole.student),
  validateRequest(generateMariiReportValidation),
  controller.generate,
);

router.route('/auto-generate').post(
  auth(TRole.student),
  validateRequest(autoGenerateMariiReportValidation),
  controller.autoGenerate,
);

router.route('/expedition/generate').post(
  auth(TRole.student),
  validateRequest(generateExpeditionMariiValidation),
  controller.generateExpedition,
);

router.route('/expedition/:journeyId').get(
  auth(TRole.student),
  validateRequest(getExpeditionMariiValidation),
  controller.getExpeditionReport,
);

router.route('/student/list').get(
  auth(TRole.student),
  controller.listForStudent,
);

router.route('/:capsuleId/pdf').get(
  auth(TRole.student),
  validateRequest(getMariiReportByCapsuleValidation),
  controller.downloadPdf,
);

router.route('/:capsuleId').get(
  auth(TRole.student),
  validateRequest(getMariiReportByCapsuleValidation),
  controller.getByCapsuleId,
);

export const MariiReportRoute = router;
