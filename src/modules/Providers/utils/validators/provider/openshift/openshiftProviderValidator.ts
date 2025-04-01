import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { validateUrlAndTokenExistence } from '../../../helpers/validateUrlAndTokenExistence';
import { validateK8sName, validateURL, type ValidationMsg } from '../../common';

export function openshiftProviderValidator(
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const token = secret?.data?.token || '';

  if (!validateK8sName(name)) {
    return { msg: 'Invalid kubernetes resource name', type: 'error' };
  }

  const validation: ValidationMsg = validateUrlAndTokenExistence(url, token);
  if (validation) return validation;

  // Validate fields
  if (url !== '' && !validateURL(url)) {
    return { msg: 'Invalid URL', type: 'error' };
  }

  return { type: 'default' };
}
