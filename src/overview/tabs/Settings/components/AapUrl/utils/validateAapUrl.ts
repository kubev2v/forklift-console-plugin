import { validateURL } from 'src/utils/validation/common';

import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

/**
 * Trim and lowercase the URL scheme so stored values match what validation accepts
 * (URL_REGEX is case-sensitive on the scheme).
 */
export const normalizeAapUrl = (value: string): string => {
  const trimmedValue = value.trim();
  const schemeSeparatorIndex = trimmedValue.indexOf('://');

  if (schemeSeparatorIndex <= 0) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, schemeSeparatorIndex).toLowerCase()}${trimmedValue.slice(schemeSeparatorIndex)}`;
};

/**
 * Optional AAP URL: empty is allowed; non-empty must be a well-formed URL.
 */
export const validateAapUrl = (value: string | undefined): string | undefined => {
  const normalizedValue = normalizeAapUrl(value ?? '');

  if (isEmpty(normalizedValue)) {
    return undefined;
  }

  if (!validateURL(normalizedValue)) {
    return t(
      'The URL is invalid. URL should include the schema, for example: https://aap.example.com.',
    );
  }

  return undefined;
};
