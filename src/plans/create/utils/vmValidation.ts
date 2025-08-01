import type { ProviderVirtualMachine } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

/**
 * Validates virtual machine selection
 * @param value - The VM selection object
 * @returns Error message string if invalid, undefined if valid
 */
export const validateVmSelection = (
  value: Record<string, ProviderVirtualMachine>,
): string | undefined => {
  if (!value || typeof value !== 'object' || isEmpty(Object.keys(value))) {
    return t('Must select at least 1 VM.');
  }

  return undefined;
};
