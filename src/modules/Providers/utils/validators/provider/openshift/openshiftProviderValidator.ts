import { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { validateUrlAndTokenExistence } from '../../../helpers/validateUrlAndTokenExistence';
import { validateK8sName, validateURL, ValidationMsg } from '../../common';

export function openshiftProviderValidator(
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const token = secret?.data?.token || '';

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'Invalid kubernetes resource name' };
  }

  const validation: ValidationMsg = validateUrlAndTokenExistence(url, token);
  if (validation) return validation;

  // validate fields
  if (url !== '' && !validateURL(url)) {
    return { type: 'error', msg: 'Invalid URL' };
  }

  return { type: 'default' };
}
