import { VddkSetupMode } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';

import type { CopyApplianceDisplayStatus } from './types';

export const getDiskTransferMethodLabel = (method: VddkSetupMode): string => {
  if (method === VddkSetupMode.Manual || method === VddkSetupMode.Upload) {
    return t('VDDK image');
  }
  if (method === VddkSetupMode.CopyAppliance) {
    return t('Copy appliance');
  }
  return t('Skip disk transfer setup');
};

export const getApplianceStatusLabel = (status: CopyApplianceDisplayStatus): string => {
  if (status === 'configured') {
    return t('Configured');
  }
  if (status === 'pending') {
    return t('Not configured');
  }
  return t('Unavailable');
};

export const getCopyApplianceDisplayStatus = (
  templateExists: boolean,
  isPending: boolean,
): CopyApplianceDisplayStatus => {
  if (templateExists) {
    return 'configured';
  }
  return isPending ? 'pending' : 'unavailable';
};

export const getPlacementErrorTitle = (
  inventoryError: Error | null,
  templateError?: string,
): string => {
  if (inventoryError) {
    return t('Unable to load vSphere placement inventory');
  }
  if (templateError) {
    return t('Unable to verify sourcing appliance template');
  }
  return t('Unable to configure sourcing appliance');
};
