import { t } from '@utils/i18n';

export const getCreateProviderButtonLabel = (
  isPlacementStep: boolean,
  isApplianceSelected: boolean,
): string => {
  if (isPlacementStep) {
    return t('Deploy');
  }
  if (isApplianceSelected) {
    return t('Create and continue');
  }
  return t('Create provider');
};
