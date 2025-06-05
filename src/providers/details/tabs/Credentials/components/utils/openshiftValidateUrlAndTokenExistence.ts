import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { t } from '@utils/i18n';
/**
 * Function to ensure that the input url, token fields are both set or both empty.
 */
export const validateUrlAndTokenExistence = (url: string, token: string): ValidationMsg | null => {
  // Empty URL + token is valid as host providers
  if (url === '' && token === '') {
    return { type: ValidationState.Default };
  }

  // If we have url, token is required
  if (url !== '' && token === '') {
    return { msg: t(`Missing required fields [token]`), type: ValidationState.Error };
  }

  // If we have token, url is required
  if (url === '' && token !== '') {
    return { msg: t(`Missing required fields [url]`), type: ValidationState.Error };
  }

  return null;
};
