import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { SecretFieldsId } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

const validateUser = (value: string): ValidationMsg => {
  const noSpaces = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`A username and domain for the ESXi API endpoint, for example: user . [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`A username and domain for the ESXi API endpoint, for example: user . [required]`),
      type: ValidationState.Error,
    };
  }

  if (!noSpaces) {
    return { msg: t(`Invalid username, spaces are not allowed`), type: ValidationState.Error };
  }

  return {
    msg: t(`A username and domain for the ESXi API endpoint, for example: user . [required]`),
    type: ValidationState.Success,
  };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`A user password for connecting to the ESXi API endpoint. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`A user password for connecting to the ESXi API endpoint. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(`A user password for connecting to the ESXi API endpoint. [required]`),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid password, spaces are not allowed`), type: ValidationState.Error };
};

export const esxiSecretFieldValidator = (id: SecretFieldsId, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  switch (id) {
    case SecretFieldsId.User:
      return validateUser(trimmedValue);
    case SecretFieldsId.Password:
      return validatePassword(trimmedValue);
    case SecretFieldsId.InsecureSkipVerify:
      return validateInsecureSkipVerify(trimmedValue);
    case SecretFieldsId.CaCert:
      return validateCacert(trimmedValue);
    case SecretFieldsId.Token:
    default:
      return { type: ValidationState.Default };
  }
};
