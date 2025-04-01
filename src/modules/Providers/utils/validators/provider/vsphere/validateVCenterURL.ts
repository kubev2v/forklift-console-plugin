import { safeBase64Decode } from '../../../helpers/safeBase64Decode';
import { validateIpv4, validateURL, ValidationMsg } from '../../common';

export const validateVCenterURL = (
  url: string | number,
  insecureSkipVerify?: string,
): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      type: 'default',
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { type: 'error', msg: 'URL is not a string' };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);
  const urlObject = getUrlObject(url);
  const urlHostname = urlObject?.hostname;
  const isSecure = !insecureSkipVerify || safeBase64Decode(insecureSkipVerify) === 'false';

  if (trimmedUrl === '') {
    return {
      type: 'error',
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk .',
    };
  }

  if (isSecure) {
    const isValidIpAddress = validateIpv4(urlHostname);

    if (isValidIpAddress) {
      return {
        type: 'warning',
        msg: 'The URL is not a fully qualified domain name (FQDN). If the certificate is not skipped and does not match the URL, the connection might fail.',
      };
    }
  }

  if (!trimmedUrl.endsWith('sdk'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk .',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
  };
};

const getUrlObject = (url: string) => {
  try {
    return new URL(url);
  } catch {
    console.error('Unable to parse URL.');
  }
};
