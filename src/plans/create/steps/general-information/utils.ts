import { validateK8sName } from 'src/utils/validation/common';

import type { V1beta1Plan } from '@kubev2v/types';
import { t } from '@utils/i18n';

/**
 * Validates a plan name
 *
 * @param value - The plan name to validate
 * @param plans - Array of existing plans to check for uniqueness
 * @returns Error message string if invalid, undefined if valid
 */
export const validatePlanName = (value: string, plans: V1beta1Plan[]) => {
  if (!value) {
    return t('Plan name is required.');
  }

  if (!validateK8sName(value)) {
    return t(
      "Plan name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
    );
  }

  if (plans.some((plan) => plan?.metadata?.name === value)) {
    return t('Plan name must be unique across all namespaces.');
  }

  return undefined;
};
