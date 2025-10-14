import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateUrlAndTokenExistence } from '../../../helpers/validateUrlAndTokenExistence';
import { validateK8sName, validateURL } from '../../common';

export const openshiftProviderValidator = (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url ?? '';
  const token = secret?.data?.token ?? '';

  if (!validateK8sName(name)) {
    return { msg: 'Invalid kubernetes resource name', type: ValidationState.Error };
  }

  const validation = validateUrlAndTokenExistence(url, token);
  if (validation) return validation;

  // validate fields
  if (url !== '' && !validateURL(url)) {
    return { msg: 'Invalid URL', type: ValidationState.Error };
  }

  return { type: ValidationState.Default };
};
