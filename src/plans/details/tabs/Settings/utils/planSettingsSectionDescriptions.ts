import type { TFunction } from 'i18next';

import { PLAN_SETTINGS_SECTION_ID, type PlanSettingsSectionId } from './planSettingsSectionIds';

export const getPlanSettingsSectionDescription = (
  sectionId: PlanSettingsSectionId,
  t: TFunction,
): string => {
  switch (sectionId) {
    case PLAN_SETTINGS_SECTION_ID.Guest:
      return t('Disk and guest conversion options applied during virt-v2v.');
    case PLAN_SETTINGS_SECTION_ID.Transfer:
      return t('How migration data moves and how guest networking is preserved.');
    case PLAN_SETTINGS_SECTION_ID.Naming:
      return t('Templates used when naming resources created during migration.');
    case PLAN_SETTINGS_SECTION_ID.Target:
      return t('Power state and placement applied to migrated virtual machines.');
    case PLAN_SETTINGS_SECTION_ID.Convertor:
      return t('Labels and scheduling for virt-v2v convertor pods that perform guest conversion.');
    default:
      return '';
  }
};
