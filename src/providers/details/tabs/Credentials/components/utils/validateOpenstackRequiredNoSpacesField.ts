import { validateNoSpaces } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

type OpenstackFieldMessages = {
  invalidMsg: string;
  requiredMsg: string;
  successMsg: string;
};

export const validateOpenstackRequiredNoSpacesField = (
  value: string,
  { invalidMsg, requiredMsg, successMsg }: OpenstackFieldMessages,
): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === undefined) {
    return { msg: requiredMsg, type: ValidationState.Default };
  }

  if (value === '') {
    return { msg: requiredMsg, type: ValidationState.Error };
  }

  if (valid) {
    return { msg: successMsg, type: ValidationState.Success };
  }

  return { msg: invalidMsg, type: ValidationState.Error };
};
