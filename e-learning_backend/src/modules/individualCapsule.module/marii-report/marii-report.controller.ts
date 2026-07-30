import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { MariiReport } from './marii-report.model';
import { IMariiReport } from './marii-report.interface';
import { MariiReportService } from './marii-report.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';

export class MariiReportController extends GenericController<
  typeof MariiReport,
  IMariiReport
> {
  mariiReportService = new MariiReportService();

  constructor() {
    super(new MariiReportService(), 'MariiReport');
  }

  generate = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.generateReport(
      studentId,
      req.body.capsuleId,
      { journeyId: req.body.journeyId },
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Marii report generated successfully',
      success: true,
    });
  });

  autoGenerate = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.generateReportIfMissing(
      studentId,
      req.body.capsuleId,
      req.body.journeyId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: result ? 'Marii report ready' : 'Report not yet available',
      success: true,
    });
  });

  downloadPdf = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const pdf = await this.mariiReportService.getReportPdf(
      studentId,
      req.params.capsuleId as string,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="marii-report-${req.params.capsuleId}.pdf"`,
    );
    res.send(pdf);
  });

  generateExpedition = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.generateExpeditionReport(
      studentId,
      req.body.journeyId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Expedition synthesis generated successfully',
      success: true,
    });
  });

  getExpeditionReport = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.getExpeditionReport(
      studentId,
      req.params.journeyId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Expedition synthesis retrieved successfully',
      success: true,
    });
  });

  getByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.getByCapsuleId(
      studentId,
      req.params.capsuleId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Marii report retrieved successfully',
      success: true,
    });
  });

  listForStudent = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.mariiReportService.listForStudent(studentId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Marii reports retrieved successfully',
      success: true,
    });
  });
}
