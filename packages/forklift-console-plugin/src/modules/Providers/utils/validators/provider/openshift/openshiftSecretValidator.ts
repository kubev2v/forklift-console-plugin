import { Base64 } from 'js-base64';

import { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { ValidationMsg } from '../../common';

import { openshiftSecretFieldValidator } from './openshiftSecretFieldValidator';

export function openshiftSecretValidator(secret: IoK8sApiCoreV1Secret): ValidationMsg {
  const url = secret?.data?.url || '';
  const token = secret?.data?.token || '';
  const cacert = secret?.data?.cacert || '';

  // Empty URL + token is valid as host providers
  if (url === '' && token === '') {
    return { type: 'default' };
  }

  // If we have url, token is required
  if (url !== '' && token === '') {
    return { type: 'error', msg: `Missing required fields [token]` };
  }

  // If we have token, url is required
  if (url === '' && token !== '') {
    return { type: 'error', msg: `Missing required fields [url]` };
  }

  // if we have url and token, validate token
  // url will be validated using the provider rules
  if (token !== '') {
    const value = Base64.decode(token);

    return openshiftSecretFieldValidator('token', value);
  }

  // If we have cacert, validate it
  if (cacert !== '') {
    const value = Base64.decode(cacert);

    return openshiftSecretFieldValidator('cacert', value);
  }

  return { type: 'default' };
}
