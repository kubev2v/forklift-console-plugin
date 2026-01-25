import { validateK8sName } from 'src/utils/validation/common';

import { t } from '@utils/i18n';

/**
 * Validates a provider name according to Kubernetes naming requirements and uniqueness
 *
 * @param value - The provider name to validate
 * @param existingProviderNames - Array of existing provider names to check for uniqueness
 * @returns Error message string if invalid, undefined if valid
 */
export const validateProviderName = (
  value: string,
  existingProviderNames?: string[],
): string | undefined => {
  if (!value || value.trim() === '') {
    return t('Provider name is required');
  }

  if (value.length > 253) {
    return t('Name must be no more than 253 characters');
  }

  if (!validateK8sName(value)) {
    return t(
      'Name must consist of lower case alphanumeric characters or "-", and must start and end with an alphanumeric character',
    );
  }

  if (existingProviderNames?.includes(value)) {
    return t('A provider named {{name}} already exists in the system', { name: value });
  }

  return undefined;
};
