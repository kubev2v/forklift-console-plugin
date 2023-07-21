import { Base64 } from 'js-base64';

import { V1Secret } from '@kubev2v/types';

import { openshiftSecretFieldValidator } from '../secret-fields';

export function openshiftSecretValidator(secret: V1Secret) {
  const url = secret?.data?.url || '';
  const token = secret?.data?.token || '';

  // Empty URL + token is valid as host providers
  if (url === '' && token === '') {
    return null;
  }

  // If we have url, token is required
  if (url !== '' && token === '') {
    return new Error(`missing required fields [token]`);
  }

  // If we have token, url is required
  if (url === '' && token !== '') {
    return new Error(`missing required fields [url]`);
  }

  // if we have url and token, validate token
  // url will be validated using the provider rules
  if (token !== '') {
    const value = Base64.decode(token);

    if (openshiftSecretFieldValidator('token', value) === 'error') {
      return new Error(`invalid token`);
    }
  }

  return null;
}
