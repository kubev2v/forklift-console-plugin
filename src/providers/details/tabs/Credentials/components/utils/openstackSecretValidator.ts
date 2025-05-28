import { missingKeysInSecretData } from 'src/modules/Providers/utils/helpers/missingKeysInSecretData';
import { OpenstackSecretFieldsId, SecretFieldsId } from 'src/providers/utils/constants';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { getAuthTypeRequiredFields } from './getAuthTypeRequiredFields';
import { getAuthTypeValidateFields } from './getAuthTypeValidateFields';
import { getDecodedValue } from './getDecodedValue';
import { openstackSecretFieldValidator } from './openstackSecretFieldValidator';

export const openstackSecretValidator = (secret: IoK8sApiCoreV1Secret): ValidationMsg => {
  const authType = getDecodedValue(secret?.data?.authType) ?? SecretFieldsId.Password;
  const requiredFields = getAuthTypeRequiredFields(secret, authType);
  const validateFields = getAuthTypeValidateFields(secret, authType);

  if (!requiredFields.length || !validateFields.length)
    return { msg: 'invalid authType', type: ValidationState.Error };

  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  if (insecureSkipVerify !== 'true') {
    validateFields.push(OpenstackSecretFieldsId.CaCert);
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
    const fieldValidation = openstackSecretFieldValidator(id, value);

    if (fieldValidation.type === ValidationState.Error) {
      return fieldValidation;
    }
  }

  return { type: ValidationState.Default };
};
