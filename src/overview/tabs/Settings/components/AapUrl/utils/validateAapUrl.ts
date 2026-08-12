import { validateURL } from 'src/utils/validation/common';

import { t } from '@utils/i18n';

/**
 * Optional AAP URL: empty is allowed; non-empty must be a well-formed URL.
 */
export const validateAapUrl = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim() ?? '';

  if (!trimmedValue) {
    return undefined;
  }

  if (!validateURL(trimmedValue)) {
    return t(
      'The URL is invalid. URL should include the schema, for example: https://example.com:6443.',
    );
  }

  return undefined;
};
