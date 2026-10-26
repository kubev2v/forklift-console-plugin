import type { TFunction } from 'i18next';

import { PLAN_SETTINGS_SECTION_ID, type PlanSettingsSectionId } from './planSettingsSectionIds';

export const getPlanSettingsSectionLabel = (
  sectionId: PlanSettingsSectionId,
  t: TFunction,
): string => {
  switch (sectionId) {
    case PLAN_SETTINGS_SECTION_ID.Guest:
      return t('Guest conversion');
    case PLAN_SETTINGS_SECTION_ID.Transfer:
      return t('Transfer and network');
    case PLAN_SETTINGS_SECTION_ID.Naming:
      return t('Naming');
    case PLAN_SETTINGS_SECTION_ID.Target:
      return t('Target VM');
    case PLAN_SETTINGS_SECTION_ID.Convertor:
      return t('Convertor pods');
    default:
      return sectionId;
  }
};
