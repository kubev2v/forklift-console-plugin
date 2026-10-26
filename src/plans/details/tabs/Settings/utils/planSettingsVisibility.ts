import { isEmpty } from '@utils/helpers';

import {
  PLAN_SETTINGS_SECTION_ID,
  PLAN_SETTINGS_SECTION_ORDER,
  type PlanSettingsSectionId,
} from './planSettingsSectionIds';

export type PlanSettingsVisibilityInput = {
  isOvirt: boolean;
  isTransferNetworkVisible: boolean;
  isVsphere: boolean;
};

const isGuestSectionVisible = ({ isOvirt, isVsphere }: PlanSettingsVisibilityInput): boolean =>
  isVsphere || isOvirt;

const isTransferSectionVisible = ({
  isTransferNetworkVisible,
  isVsphere,
}: PlanSettingsVisibilityInput): boolean => isTransferNetworkVisible || isVsphere;

const isNamingSectionVisible = ({ isVsphere }: PlanSettingsVisibilityInput): boolean => isVsphere;

const isTargetSectionVisible = (): boolean => true;

const isConvertorSectionVisible = ({ isVsphere }: PlanSettingsVisibilityInput): boolean =>
  isVsphere;

const SECTION_VISIBILITY: Record<
  PlanSettingsSectionId,
  (input: PlanSettingsVisibilityInput) => boolean
> = {
  [PLAN_SETTINGS_SECTION_ID.Convertor]: isConvertorSectionVisible,
  [PLAN_SETTINGS_SECTION_ID.Guest]: isGuestSectionVisible,
  [PLAN_SETTINGS_SECTION_ID.Naming]: isNamingSectionVisible,
  [PLAN_SETTINGS_SECTION_ID.Target]: isTargetSectionVisible,
  [PLAN_SETTINGS_SECTION_ID.Transfer]: isTransferSectionVisible,
};

export const getVisiblePlanSettingsSections = (
  input: PlanSettingsVisibilityInput,
): PlanSettingsSectionId[] =>
  PLAN_SETTINGS_SECTION_ORDER.filter((sectionId) => SECTION_VISIBILITY[sectionId](input));

export const resolvePlanSettingsSection = (
  requestedSection: string | null | undefined,
  visibleSections: PlanSettingsSectionId[],
): PlanSettingsSectionId => {
  if (isEmpty(visibleSections)) {
    return PLAN_SETTINGS_SECTION_ID.Target;
  }

  const isRequestedVisible =
    requestedSection !== null &&
    requestedSection !== undefined &&
    visibleSections.includes(requestedSection as PlanSettingsSectionId);

  if (isRequestedVisible) {
    return requestedSection as PlanSettingsSectionId;
  }

  return visibleSections[0];
};
