import { validateK8sName } from 'src/modules/Providers/utils/validators/common';

import { t } from '@utils/i18n';

/**
 * Validator for map names (storage, network) according to Kubernetes DNS subdomain requirements
 */
export const validateMapName = (value: string, mapType: string): string | undefined => {
  if (!value || value.trim() === '') {
    return t('{{mapType}} name is required.', { mapType });
  }

  if (!validateK8sName(value)) {
    return t(
      '{{mapType}} name must be a valid DNS subdomain name. It should contain only lowercase alphanumeric characters or hyphens, and must start and end with alphanumeric characters.',
      { mapType },
    );
  }

  return undefined;
};
