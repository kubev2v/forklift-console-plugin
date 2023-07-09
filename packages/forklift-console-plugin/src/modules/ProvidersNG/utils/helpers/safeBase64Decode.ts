import { Base64 } from 'js-base64';

export function safeBase64Decode(value: string) {
  try {
    return Base64.decode(value);
  } catch {
    return '';
  }
}
