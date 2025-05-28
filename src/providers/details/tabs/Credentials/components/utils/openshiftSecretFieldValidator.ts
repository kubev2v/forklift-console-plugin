import { validateK8sToken } from 'src/modules/Providers/utils/validators/common';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { t } from '@utils/i18n';

import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

const validateToken = (value: string): ValidationMsg => {
  const valid = validateK8sToken(value);

  if (value === undefined || value === '') {
    return {
      msg: t(
        `A service account token, optional, used for authenticating the the connection to the API server.`,
      ),
      type: ValidationState.Default,
    };
  }

  if (valid) {
    return {
      msg: t(
        `A service account token, optional, used for authenticating the the connection to the API server.`,
      ),
      type: ValidationState.Success,
    };
  }

  return {
    msg: t(`Invalid token, a valid Kubernetes service account token is required`),
    type: ValidationState.Error,
  };
};

export const openshiftSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  switch (id) {
    case 'token':
      return validateToken(trimmedValue);
    case 'insecureSkipVerify':
      return validateInsecureSkipVerify(trimmedValue);
    case 'cacert':
      return validateCacert(trimmedValue);
    default:
      return { type: ValidationState.Default };
  }
};
