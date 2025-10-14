import { SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { getDecodedValue } from './getDecodedValue';
import { missingKeysInSecretData } from './missingKeysInSecretData';
import { vcenterSecretFieldValidator } from './vcenterSecretFieldValidator';

export const vcenterSecretValidator = (secret: IoK8sApiCoreV1Secret): ValidationMsg => {
  const requiredFields = [SecretFieldsId.User, SecretFieldsId.Password];
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
      msg: t(`missing required fields [${missingRequiredFields.join(', ')}]`),
      type: ValidationState.Error,
    };
  }

  for (const id of validateFields) {
    const value = getDecodedValue(secret?.data?.[id]) ?? '';

    const fieldValidation = vcenterSecretFieldValidator(id, value);

    if (fieldValidation.type === ValidationState.Error) {
      return fieldValidation;
    }
  }

  return { type: ValidationState.Default };
};
