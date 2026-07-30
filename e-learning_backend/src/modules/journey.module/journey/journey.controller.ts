import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { Journey } from './journey.model';
import { IJourney } from './journey.interface';
import { JourneyService } from './journey.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { generateStripePriceId, updateStripePriceId } from '../../../helpers/stripePriceGenerator';

export class JourneyController extends GenericController<
  typeof Journey,
  IJourney
> {
  journeyService = new JourneyService();

  constructor() {
    super(new JourneyService(), 'Journey');
  }

  createOrUpdate = catchAsync(async (req: Request, res: Response) => {
    const data: IJourney = req.body;
    
    const existingJourney = await Journey.findOne({ isDeleted: false });
    
    if (existingJourney) {
      if (existingJourney.priceId && existingJourney.price !== data.price) {
        data.priceId = await updateStripePriceId(
          existingJourney.priceId,
          data.title,
          data.price,
          'usd',
          data.journeyType === 'free'
        ) || undefined;
      }
    } else {
      data.priceId = await generateStripePriceId(
        data.title,
        data.price,
        'usd',
        data.journeyType === 'free'
      ) || undefined;
    }

    const result = await this.service.createOrUpdate(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Journey upsert successfully',
      success: true,
    });
  });

  getJourneyDetailsWithJourneyCapsules = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await this.journeyService.getJourneyDetailsWithJourneyCapsules(options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Journey details with capsules retrieved successfully',
      success: true,
    });
  });

  getJourneyProgress = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyService.getJourneyProgress(req.user?.userId);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Journey progress retrieved successfully',
      success: true,
    });
  });
}
