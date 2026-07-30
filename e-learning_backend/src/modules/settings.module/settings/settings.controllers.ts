//@ts-ignore
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SettingsService } from './settings.service';
import { settingsType, TSettingsSlug } from './settings.constant';

const settingsService = new SettingsService();

const sendSettingsResponse = (
  res: Response,
  message: string,
  data: unknown,
  code = StatusCodes.OK,
) => {
  sendResponse(res, {
    code,
    message,
    data,
    success: true,
  });
};

const getTypeFromQuery = (req: Request) => req.query.type as settingsType;
const getTypeFromSlug = (req: Request) =>
  settingsService.resolveTypeFromSlug(req.params.slug as TSettingsSlug);

const createOrUpdateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await settingsService.createOrUpdateSettings(getTypeFromQuery(req), req.body);

  sendSettingsResponse(res, `${result.type} updated successfully`, result);
});

const getDetailsByType = catchAsync(async (req: Request, res: Response) => {
  const result = await settingsService.getDetailsByType(getTypeFromQuery(req));

  sendSettingsResponse(res, `${result.type} fetched successfully`, result);
});

const getPublicSettingsBySlug = catchAsync(async (req: Request, res: Response) => {
  const type = getTypeFromSlug(req);
  const result = await settingsService.getDetailsByType(type);

  sendSettingsResponse(res, `${result.type} fetched successfully`, result);
});

const updateSettingsBySlug = catchAsync(async (req: Request, res: Response) => {
  const type = getTypeFromSlug(req);
  const result = await settingsService.createOrUpdateSettings(type, req.body);

  sendSettingsResponse(res, `${result.type} updated successfully`, result);
});

export const SettingsController = {
  createOrUpdateSettings,
  getDetailsByType,
  getPublicSettingsBySlug,
  updateSettingsBySlug,
};
