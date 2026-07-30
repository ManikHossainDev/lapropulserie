export enum settingsType {
  aboutUs = 'aboutUs',
  contactUs = 'contactUs',
  privacyPolicy = 'privacyPolicy',
  termsAndConditions = 'termsAndConditions',
  introductionVideo = 'introductionVideo',
}

export const settingsTypeSlugMap = {
  'about-us': settingsType.aboutUs,
  'contact-us': settingsType.contactUs,
  'privacy-policy': settingsType.privacyPolicy,
  'terms-and-conditions': settingsType.termsAndConditions,
} as const;

export type TSettingsSlug = keyof typeof settingsTypeSlugMap;

export const editableSettingsTypes = [
  settingsType.aboutUs,
  settingsType.contactUs,
  settingsType.privacyPolicy,
  settingsType.termsAndConditions,
] as const;
