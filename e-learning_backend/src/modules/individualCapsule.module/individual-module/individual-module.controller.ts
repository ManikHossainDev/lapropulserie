import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualModule } from './individual-module.model';
import { IIndividualModule } from './individual-module.interface';
import { IndividualModuleService } from './individual-module.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

export class IndividualModuleController extends GenericController<
  typeof IndividualModule,
  IIndividualModule
> {
  individualModuleService = new IndividualModuleService();

  constructor() {
    super(new IndividualModuleService(), 'IndividualModule');
  }

  createWithLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.individualModuleService.createWithLessons(
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualModule with lessons created successfully',
      success: true,
    });
  });

  updateWithLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.individualModuleService.updateWithLessons(
      req.params.id as string,
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualModule with lessons updated successfully',
      success: true,
    });
  });
}
