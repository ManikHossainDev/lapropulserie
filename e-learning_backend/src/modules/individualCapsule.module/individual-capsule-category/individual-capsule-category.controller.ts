import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualCapsuleCategory } from './individual-capsule-category.model';
import { IIndividualCapsuleCategory } from './individual-capsule-category.interface';
import { IndividualCapsuleCategoryService } from './individual-capsule-category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { generateStripePriceId, updateStripePriceId } from '../../../helpers/stripePriceGenerator';
import { normalizeCategoryPricing } from './individual-capsule-category.helpers';

export class IndividualCapsuleCategoryController extends GenericController<
  typeof IndividualCapsuleCategory,
  IIndividualCapsuleCategory
> {
  individualCapsuleCategoryService = new IndividualCapsuleCategoryService();

  constructor() {
    super(new IndividualCapsuleCategoryService(), 'IndividualCapsuleCategory');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    let data: IIndividualCapsuleCategory = normalizeCategoryPricing(req.body);

    if (data.sellIndividually && data.price > 0) {
      data.priceId = await generateStripePriceId(
        data.title,
        data.price,
        'usd',
        data.capsuleType === 'free',
      ) || undefined;
    } else {
      data.priceId = undefined;
    }

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualCapsuleCategory created successfully',
      success: true,
    });
  });

  updateById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    let data: IIndividualCapsuleCategory = normalizeCategoryPricing(req.body);

    const existingCategory = await IndividualCapsuleCategory.findById(id);

    if (data.sellIndividually && data.price > 0) {
      const priceChanged =
        existingCategory && existingCategory.price !== data.price;
      const wasNotSoldIndividually = existingCategory && !existingCategory.sellIndividually;

      if (existingCategory?.priceId && (priceChanged || wasNotSoldIndividually)) {
        data.priceId = await updateStripePriceId(
          existingCategory.priceId,
          data.title || existingCategory.title,
          data.price,
          'usd',
          (data.capsuleType ?? existingCategory.capsuleType) === 'free',
        ) || undefined;
      } else if (!existingCategory?.priceId) {
        data.priceId = await generateStripePriceId(
          data.title || existingCategory?.title || 'Category',
          data.price,
          'usd',
          (data.capsuleType ?? existingCategory?.capsuleType) === 'free',
        ) || undefined;
      }
    } else {
      data.priceId = undefined;
    }

    const result = await this.service.updateById(id, data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualCapsuleCategory updated successfully',
      success: true,
    });
  });

  getAllCapsulesByCategoryId = catchAsync(
    async (req: Request, res: Response) => {
      const capsuleCategoryId = req.params.capsuleCategoryId as string;
      const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

      const result =
        await this.individualCapsuleCategoryService.getAllCapsulesByCategoryIdV2(
          options,
          capsuleCategoryId,
        );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Capsules retrieved successfully by category',
        success: true,
      });
    },
  );

  getAllCapsulesWithRatingInfoByCategoryId = catchAsync(
    async (req: Request, res: Response) => {
      const capsuleCategoryId = req.params.capsuleCategoryId as string;
      const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

      const result =
        await this.individualCapsuleCategoryService.getAllCapsulesWithRatingInfoByCategoryIdV2(
          options,
          capsuleCategoryId,
        );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Capsules with rating info retrieved successfully',
        success: true,
      });
    },
  );
}
