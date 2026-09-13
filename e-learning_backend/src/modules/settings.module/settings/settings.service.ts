//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  editableSettingsTypes,
  settingsType,
  settingsTypeSlugMap,
  TSettingsSlug,
} from './settings.constant';
import { ISettings } from './settings.interface';
import { Settings } from './settings.model';
import { GenericService } from '../../_generic-module/generic.services';

export class SettingsService extends GenericService<
  typeof Settings,
  ISettings
> {
  constructor() {
    super(Settings);
  }

  private assertEditableType(type: settingsType) {
    if (!editableSettingsTypes.includes(type as any)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Unsupported settings type: ${type}. Allowed types are ${editableSettingsTypes.join(', ')}`,
      );
    }
  }

  private mapDocument(setting: ISettings | null) {
    if (!setting) {
      return null;
    }

    const document = (setting as any).toJSON ? (setting as any).toJSON() : setting;

    return {
      ...document,
      content: document.content || document.details || '',
    };
  }

  resolveTypeFromSlug(slug: TSettingsSlug) {
    const type = settingsTypeSlugMap[slug];

    if (!type) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Unsupported settings slug: ${slug}`);
    }

    return type;
  }

  //----------------------------------
  // Admin | Sub Admin 
  //----------------------------------
  async createOrUpdateSettings(type: settingsType, payload: { content?: string; details?: string }) {
    this.assertEditableType(type);

    const content = payload.content ?? payload.details ?? '';
    const setting = await Settings.findOneAndUpdate(
      { type },
      { type, details: content },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return this.mapDocument(setting);
  }

  async getDetailsByType(type: settingsType) {
    this.assertEditableType(type);

    let setting = await Settings.findOne({ type });

    if (!setting) {
      setting = await Settings.create({
        type,
        details: '',
      });
    }

    return this.mapDocument(setting);
  }
}
