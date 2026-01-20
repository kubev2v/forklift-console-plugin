import { validatePublicCert } from 'src/providers/utils/validators/common';

import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined || value === '') {
    return {
      msg: t(
        `The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.`,
      ),
      type: ValidationState.Default,
    };
  }

  if (valid) {
    return {
      msg: t(
        `The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.`,
      ),
      type: ValidationState.Success,
    };
  }

  return {
    msg: t(`Invalid CA certificate, certificate must be in a valid PEM encoded X.509 format.`),
    type: ValidationState.Error,
  };
};
