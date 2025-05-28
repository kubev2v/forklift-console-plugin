import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

export const validateInsecureSkipVerify = (value: string): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return { msg: 'Migrate without validating a CA certificate', type: ValidationState.Default };
  }

  const valid = ['true', 'false', ''].includes(value);

  if (valid) {
    return { msg: 'Migrate without validating a CA certificate', type: ValidationState.Success };
  }

  return {
    msg: 'Invalid Skip certificate validation value, must be true or false',
    type: ValidationState.Error,
  };
};
