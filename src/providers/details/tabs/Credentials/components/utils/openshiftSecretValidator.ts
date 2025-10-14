import { SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { getDecodedValue } from './getDecodedValue';
import { openshiftSecretFieldValidator } from './openshiftSecretFieldValidator';
import { validateUrlAndTokenExistence } from './openshiftValidateUrlAndTokenExistence';

export const openshiftSecretValidator = (
  secret: IoK8sApiCoreV1Secret,
  provider: V1beta1Provider,
): ValidationMsg => {
  const url = provider?.spec?.url ?? '';
  const token = secret?.data?.token ?? '';

  const validation = validateUrlAndTokenExistence(url, token);
  if (validation) return validation;

  // Validate fields
  const validateFields = [
    SecretFieldsId.User,
    SecretFieldsId.Token,
    SecretFieldsId.InsecureSkipVerify,
  ];
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  if (insecureSkipVerify !== 'true') {
    validateFields.push(SecretFieldsId.CaCert);
  }

  for (const id of validateFields) {
    const value = getDecodedValue(secret?.data?.[id]) ?? '';
    const fieldValidation = openshiftSecretFieldValidator(id, value);

    if (fieldValidation.type === ValidationState.Error) {
      return fieldValidation;
    }
  }

  return { type: ValidationState.Default };
};
