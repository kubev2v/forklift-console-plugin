import { validateURL } from 'src/utils/validation/common';

import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

/**
 * Optional AAP URL: empty is allowed; non-empty must be a well-formed URL.
 */
export const validateAapUrl = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim() ?? '';

  if (isEmpty(trimmedValue)) {
    return undefined;
  }

  // URL_REGEX is case-sensitive on the scheme; normalize so HTTPS:// still validates.
  const schemeSeparatorIndex = trimmedValue.indexOf('://');
  const withNormalizedScheme =
    schemeSeparatorIndex > 0
      ? `${trimmedValue.slice(0, schemeSeparatorIndex).toLowerCase()}${trimmedValue.slice(schemeSeparatorIndex)}`
      : trimmedValue;

  if (!validateURL(withNormalizedScheme)) {
    return t(
      'The URL is invalid. URL should include the schema, for example: https://aap.example.com.',
    );
  }

  return undefined;
};
