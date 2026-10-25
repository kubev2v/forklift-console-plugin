import { VddkSetupMode } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';

export const getTemplateOperation = (
  isAppliance: boolean,
  templateExists: boolean,
): 'create' | 'delete' | undefined => {
  if (isAppliance && !templateExists) {
    return 'create';
  }
  if (!isAppliance && templateExists) {
    return 'delete';
  }
  return undefined;
};

export const getTemplateLookupError = (
  method: VddkSetupMode,
  initialMethod: VddkSetupMode,
  unavailable: boolean,
): string | undefined => {
  if (!unavailable) {
    return undefined;
  }
  const isVddk = method === VddkSetupMode.Manual || method === VddkSetupMode.Upload;
  if (isVddk && initialMethod !== VddkSetupMode.CopyAppliance) {
    return undefined;
  }
  return t(
    'Unable to check whether a sourcing appliance template exists. Verify that CopyApplianceTemplate resources are available and readable, then try again.',
  );
};

export const getCopyAppliancePermissionError = (
  isAppliance: boolean,
  enabled: boolean,
  lookupUnavailable: boolean,
  permissionError?: string,
): string | undefined => {
  if (isAppliance && !enabled) {
    return t('Copy appliance setup is unavailable while the feature is disabled.');
  }
  return lookupUnavailable ? undefined : permissionError;
};
