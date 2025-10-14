import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateInsecureSkipVerify = (value: string): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return { msg: t(`Migrate without validating a CA certificate`), type: ValidationState.Default };
  }

  const valid = ['true', 'false', ''].includes(value);

  if (valid) {
    return { msg: t(`Migrate without validating a CA certificate`), type: ValidationState.Success };
  }

  return {
    msg: t(`Invalid Skip certificate validation value, must be true or false`),
    type: ValidationState.Error,
  };
};
