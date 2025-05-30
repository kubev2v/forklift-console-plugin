import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

const validateUser = (value: string): ValidationMsg => {
  const noSpaces = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A username and domain for the ESXi API endpoint, for example: user . [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'A username and domain for the ESXi API endpoint, for example: user . [required]',
      type: ValidationState.Error,
    };
  }

  if (!noSpaces) {
    return { msg: 'Invalid username, spaces are not allowed', type: ValidationState.Error };
  }

  return {
    msg: 'A username and domain for the ESXi API endpoint, for example: user .',
    type: ValidationState.Success,
  };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A user password for connecting to the ESXi API endpoint. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'A user password for connecting to the ESXi API endpoint. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'A user password for connecting to the ESXi API endpoint.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid password, spaces are not allowed', type: ValidationState.Error };
};

export const esxiSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  switch (id) {
    case 'user':
      return validateUser(trimmedValue);
    case 'password':
      return validatePassword(trimmedValue);
    case 'insecureSkipVerify':
      return validateInsecureSkipVerify(trimmedValue);
    case 'cacert':
      return validateCacert(trimmedValue);
    default:
      return { type: ValidationState.Default };
  }
};
