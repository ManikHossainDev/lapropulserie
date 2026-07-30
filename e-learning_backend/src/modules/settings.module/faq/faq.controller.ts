import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Faq } from './faq.model';
import { IFaq } from './faq.interface';
import { FaqService } from './faq.service';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';

export class FaqController extends GenericController<
  typeof Faq,
  IFaq
> {
  FaqService = new FaqService();

  constructor() {
    super(new FaqService(), 'Faq');
  }

  bulkCreate = catchAsync(async (req: Request, res: Response) => {
    const { faqCategoryId, faqs } = req.body;

    const faqsWithCategory = faqs.map((faq: Partial<IFaq>) => ({
      ...faq,
      faqCategoryId,
    }));

    const result = await this.FaqService.bulkCreate(faqsWithCategory);

    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: 'FAQs created successfully',
      success: true,
    });
  });

  bulkUpdate = catchAsync(async (req: Request, res: Response) => {
    const { faqs } = req.body;

    const result = await this.FaqService.bulkUpdate(faqs);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'FAQs updated successfully',
      success: true,
    });
  });

  bulkDelete = catchAsync(async (req: Request, res: Response) => {
    const { faqIds } = req.body;

    const result = await this.FaqService.bulkDelete(faqIds);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'FAQs deleted successfully',
      success: true,
    });
  });

  bulkSoftDelete = catchAsync(async (req: Request, res: Response) => {
    const { faqIds } = req.body;

    const result = await this.FaqService.bulkSoftDelete(faqIds);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'FAQs soft deleted successfully',
      success: true,
    });
  });

  getFaqsByCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryId = req.params.categoryId as string;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.FaqService.getFaqsByCategoryId(categoryId, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'FAQs retrieved successfully',
      success: true,
    });
  });
}
