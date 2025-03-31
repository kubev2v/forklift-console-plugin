import { safeBase64Decode } from '../../../helpers';
import { validateIpv4, validateURL, type ValidationMsg } from '../../common';

export const validateVCenterURL = (
  url: string | number,
  insecureSkipVerify?: string,
): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: 'error' };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);
  const urlObject = getUrlObject(url);
  const urlHostname = urlObject?.hostname;
  const isSecure = !insecureSkipVerify || safeBase64Decode(insecureSkipVerify) === 'false';

  if (trimmedUrl === '') {
    return {
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
      type: 'error',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk .',
      type: 'error',
    };
  }

  if (isSecure) {
    const isValidIpAddress = validateIpv4(urlHostname);

    if (isValidIpAddress) {
      return {
        msg: 'The URL is not a fully qualified domain name (FQDN). If the certificate is not skipped and does not match the URL, the connection might fail.',
        type: 'warning',
      };
    }
  }

  if (!trimmedUrl.endsWith('sdk'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk .',
      type: 'warning',
    };

  return {
    msg: 'The URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    type: 'success',
  };
};

const getUrlObject = (url: string) => {
  try {
    return new URL(url);
  } catch {
    console.error('Unable to parse URL.');
  }
};
