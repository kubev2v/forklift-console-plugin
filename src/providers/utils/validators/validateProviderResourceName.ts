import { validateK8sName } from 'src/modules/Providers/utils/validators/common';

import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateProviderResourceName = (
  name: string | undefined,
  providerNames: string[],
): ValidationMsg => {
  if (name === undefined) {
    return {
      msg: t('The provider name is required'),
      type: ValidationState.Default,
    };
  }

  const trimmedValue = name.trim();

  if (trimmedValue === '') {
    return {
      msg: t('The provider name is required.'),
      type: ValidationState.Error,
    };
  }

  if (providerNames.includes(trimmedValue)) {
    return {
      msg: t(`A provider named ${trimmedValue} already exists in the system`),
      type: ValidationState.Error,
    };
  }

  if (!validateK8sName(trimmedValue)) {
    return {
      msg: t(
        `The provider name is a invalid. It should contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character`,
      ),
      type: ValidationState.Error,
    };
  }

  return {
    msg: 'The provider name is unique and required.',
    type: ValidationState.Success,
  };
};
