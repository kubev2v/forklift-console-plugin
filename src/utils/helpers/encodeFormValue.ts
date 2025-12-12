import { encode } from 'js-base64';

/**
 * Encodes a form value by trimming whitespace and base64 encoding it.
 * Returns an empty encoded string if the value is undefined or empty.
 */
export const encodeFormValue = (value: string | undefined): string => {
  return encode(value?.trim() ?? '');
};
