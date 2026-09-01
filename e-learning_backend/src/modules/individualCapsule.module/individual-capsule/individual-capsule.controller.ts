import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualCapsule } from './individual-capsule.model';
import { IIndividualCapsule, IVideoInfo } from './individual-capsule.interface';
import { IndividualCapsuleService } from './individual-capsule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { generateStripePriceId, updateStripePriceId } from '../../../helpers/stripePriceGenerator';
import { applyCategoryCommercialDefaults } from './individual-capsule.helpers';
import ApiError from '../../../errors/ApiError';
import {
  enqueueVideoProcessingJob,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';
import { logger } from '../../../shared/logger';
import { TRole } from '../../../middlewares/roles';
import { assertStudentCapsuleAccess } from '../shared/capsule-access.helper';

function videoDebug(step: string, payload: unknown) {
  logger.info(`[VIDEO DEBUG] ${step} ${JSON.stringify(payload)}`);
}

function normalizeVideoField(value: unknown): IVideoInfo | undefined {
  if (!value) return undefined;

  const extractUrl = (raw: string): string | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const iframeSrc = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
    if (iframeSrc?.[1]) return iframeSrc[1].trim();
    const yt = trimmed.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/i,
    );
    if (yt?.[1]) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return undefined;
  };

  if (typeof value === 'string') {
    const url = extractUrl(value);
    return url ? { url, status: 'ready' } : undefined;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === 'string' && obj.url.trim()) {
      const url = extractUrl(obj.url) || obj.url.trim();
      return {
        url,
        status: (obj.status as IVideoInfo['status']) || 'ready',
        ...(typeof obj.duration === 'number' ? { duration: obj.duration } : {}),
        ...(typeof obj.errorMessage === 'string'
          ? { errorMessage: obj.errorMessage }
          : {}),
      };
    }
    // Processing placeholder without URL = stuck upload; don't keep re-saving it
    if (obj.status === 'processing' && !obj.url) {
      return undefined;
    }
    if (obj.status === 'processing' || obj.status === 'failed') {
      return obj as IVideoInfo;
    }
  }
  return undefined;
}

function applyUploadedVideos(data: IIndividualCapsule, body: Record<string, any>) {
  videoDebug('applyUploadedVideos:in', {
    bodyFounder: body.founderVideo,
    bodyInspiration: body.inspirationVideo,
    bodyScience: body.scienceVideo,
    nestedFounder: data.introduction?.founderVideo,
    nestedInspiration: data.inspiration?.inspirationVideo,
    nestedScience: data.science?.optionalVideo,
  });

  // Uploaded file always wins over nested JSON (which may still carry the prior URL as fallback).
  const introFromUpload = normalizeVideoField(body.founderVideo);
  if (introFromUpload) {
    data.introduction = {
      ...(data.introduction || {}),
      founderVideo: introFromUpload,
    };
  } else if (data.introduction && data.introduction.founderVideo === null) {
    // explicit clear from admin — leave null for service $unset
  } else if (data.introduction) {
    const nested = normalizeVideoField(data.introduction.founderVideo);
    data.introduction = {
      ...data.introduction,
      ...(nested ? { founderVideo: nested } : {}),
    };
  }

  const inspirationFromUpload = normalizeVideoField(body.inspirationVideo);
  if (inspirationFromUpload) {
    data.inspiration = {
      ...(data.inspiration || {}),
      inspirationVideo: inspirationFromUpload,
    };
  } else if (data.inspiration && data.inspiration.inspirationVideo === null) {
    // explicit clear
  } else if (data.inspiration) {
    const nested = normalizeVideoField(data.inspiration.inspirationVideo);
    data.inspiration = {
      ...data.inspiration,
      ...(nested ? { inspirationVideo: nested } : {}),
    };
  }

  const scienceFromUpload = normalizeVideoField(body.scienceVideo);
  if (scienceFromUpload) {
    data.science = {
      ...(data.science || {}),
      optionalVideo: scienceFromUpload,
    };
  } else if (data.science && data.science.optionalVideo === null) {
    // explicit clear
  } else if (data.science) {
    const nested = normalizeVideoField(data.science.optionalVideo);
    data.science = {
      ...data.science,
      ...(nested ? { optionalVideo: nested } : {}),
    };
  }

  // Top-level multer fields must not be $set onto the capsule document
  delete (data as any).founderVideo;
  delete (data as any).inspirationVideo;
  delete (data as any).scienceVideo;

  videoDebug('applyUploadedVideos:out', {
    introduction: data.introduction,
    inspiration: data.inspiration,
    science: data.science,
  });
}

async function enqueueStagedVideos(
  req: Request,
  capsuleId: string,
) {
  const tokens = (req.body.__videoUploadTokens || {}) as VideoUploadTokenMap;
  const staged = req.stagedVideoUploads;
  videoDebug('enqueueStagedVideos', {
    capsuleId,
    tokens,
    stagedKeys: staged ? Object.keys(staged) : [],
  });
  if (!staged) {
    videoDebug('enqueueStagedVideos:skip', 'no stagedVideoUploads on request');
    return;
  }

  const jobs: Array<{ token?: string; fieldPath: string }> = [
    { token: tokens.founderVideo, fieldPath: 'introduction.founderVideo' },
    { token: tokens.inspirationVideo, fieldPath: 'inspiration.inspirationVideo' },
    { token: tokens.scienceVideo, fieldPath: 'science.optionalVideo' },
  ];

  for (const job of jobs) {
    if (!job.token) continue;
    const stagedUpload = staged[job.token];
    if (!stagedUpload) continue;

    videoDebug('enqueue job', { fieldPath: job.fieldPath, sourceKey: stagedUpload.sourceKey });
    await enqueueVideoProcessingJob(stagedUpload, {
      targetModel: 'IndividualCapsule',
      targetId: capsuleId,
      fieldPath: job.fieldPath,
    });
  }
}

export class IndividualCapsuleController extends GenericController<
  typeof IndividualCapsule,
  IIndividualCapsule
> {
  individualCapsuleService = new IndividualCapsuleService();

  constructor() {
    super(new IndividualCapsuleService(), 'IndividualCapsule');
  }

  /**
   * Student must own / unlock the capsule (#50). Admins keep full access for CMS.
   * Optional `?journeyId=` scopes expedition unlock.
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const role = req.user?.role;
    const userId = (req.user?.userId || req.user?._id) as string | undefined;

    if (role === TRole.student) {
      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }
      const journeyId =
        typeof req.query.journeyId === 'string' ? req.query.journeyId : undefined;
      await assertStudentCapsuleAccess(userId, id, { journeyId });
    } else if (role !== TRole.admin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }

    const result = await this.service.getById(id);
    if (!result) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`,
      );
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualCapsule retrieved successfully',
    });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    let data: IIndividualCapsule = req.body;
    data.adminId = req.user.userId || (req.user?._id as any);

    applyUploadedVideos(data, req.body);
    const videoTokens = (req.body as Record<string, any>).__videoUploadTokens;
    delete (req.body as Record<string, any>).__videoUploadTokens;

    ({ data } = await applyCategoryCommercialDefaults(data));

    if (!data.priceId) {
      data.priceId = await generateStripePriceId(
        data.title,
        data.price,
        'eur',
        data.capsuleType === 'free',
      ) || undefined;
    }

    const result = await this.individualCapsuleService.create(data);

    if ((result as any)?._id) {
      (req.body as Record<string, any>).__videoUploadTokens = videoTokens;
      await enqueueStagedVideos(req, (result as any)._id.toString());
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualCapsule created successfully',
      success: true,
    });
  });


  updateById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    let data: IIndividualCapsule = req.body;

    applyUploadedVideos(data, req.body);
    const videoTokens = (req.body as Record<string, any>).__videoUploadTokens;
    delete (req.body as Record<string, any>).__videoUploadTokens;

    const existingCapsule = await IndividualCapsule.findById(id);
    if (!existingCapsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'IndividualCapsule not found');
    }

    data.capsuleCategoryId = data.capsuleCategoryId ?? existingCapsule.capsuleCategoryId;
    ({ data } = await applyCategoryCommercialDefaults(data));

    if (existingCapsule.priceId && data.price !== undefined && existingCapsule.price !== data.price) {
      data.priceId = await updateStripePriceId(
        existingCapsule.priceId,
        data.title || existingCapsule.title,
        data.price,
        'eur',
        data.capsuleType === 'free',
      ) || undefined;
    }

    const result = await this.individualCapsuleService.updateById(id, data);

    (req.body as Record<string, any>).__videoUploadTokens = videoTokens;
    await enqueueStagedVideos(req, id);

    videoDebug('updateById:saved', {
      id,
      founderVideo: (result as any)?.introduction?.founderVideo,
      inspirationVideo: (result as any)?.inspiration?.inspirationVideo,
      scienceVideo: (result as any)?.science?.optionalVideo,
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'IndividualCapsule updated successfully',
      success: true,
    });
  });

  getAllModulesByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await this.individualCapsuleService.getAllModulesByCapsuleId(
      options,
      capsuleId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Modules retrieved successfully',
      success: true,
    });
  });

  getWithModulesAndReviews = catchAsync(async (req: Request, res: Response) => {
    const { individualCapsuleId } = req.params;
    const result = await this.individualCapsuleService.getWithModulesAndReviews(
      individualCapsuleId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result.data,
      message: 'Capsule with modules, lessons, and reviews retrieved successfully',
      success: true,
    });
  });
}
