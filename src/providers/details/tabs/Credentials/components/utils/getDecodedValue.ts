import { decode } from 'js-base64';

export const getDecodedValue = (encodedValue: string | undefined): string | undefined =>
  encodedValue && decode(encodedValue);
