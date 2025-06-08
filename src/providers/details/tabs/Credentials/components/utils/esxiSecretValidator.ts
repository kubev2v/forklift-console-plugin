import { missingKeysInSecretData } from 'src/modules/Providers/utils/helpers/missingKeysInSecretData';
import { SecretFieldsId } from 'src/providers/utils/constants';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { esxiSecretFieldValidator } from './esxiSecretFieldValidator';
import { getDecodedValue } from './getDecodedValue';

export const esxiSecretValidator = (secret: IoK8sApiCoreV1Secret): ValidationMsg => {
  const requiredFields = ['user', 'password'];
  const validateFields = [
    SecretFieldsId.User,
    SecretFieldsId.Password,
    SecretFieldsId.InsecureSkipVerify,
  ];
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  if (insecureSkipVerify !== 'true') {
    validateFields.push(SecretFieldsId.CaCert);
  }

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (!isEmpty(missingRequiredFields)) {
    return {
      msg: `missing required fields [${missingRequiredFields.join(', ')}]`,
      type: ValidationState.Error,
    };
  }

  for (const id of validateFields) {
    const value = getDecodedValue(secret?.data?.[id]) ?? '';

    const fieldValidation = esxiSecretFieldValidator(id, value);

    if (fieldValidation.type === ValidationState.Error) {
      return fieldValidation;
    }
  }

  return { type: ValidationState.Default };
};
