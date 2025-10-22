import { MTVConsole } from '@utils/console';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { safeBase64Decode } from '../../../helpers/safeBase64Decode';
import { validateIpv4, validateURL } from '../../common';

const getUrlObject = (url: string) => {
  try {
    return new URL(url);
  } catch {
    MTVConsole.error('Unable to parse URL.');
  }
  return undefined;
};

export const validateVCenterURL = (
  url: string | number | undefined,
  insecureSkipVerify?: string,
): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: ValidationState.Error };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);
  const urlObject = getUrlObject(url);
  const urlHostname = urlObject?.hostname;
  const isSecure = !insecureSkipVerify || safeBase64Decode(insecureSkipVerify) === 'false';

  if (trimmedUrl === '') {
    return {
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
      type: ValidationState.Error,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk .',
      type: ValidationState.Error,
    };
  }

  if (isSecure) {
    const isValidIpAddress = urlHostname && validateIpv4(urlHostname);

    if (isValidIpAddress) {
      return {
        msg: 'The URL is not a fully qualified domain name (FQDN). If the certificate is not skipped and does not match the URL, the connection might fail.',
        type: ValidationState.Warning,
      };
    }
  }

  if (!trimmedUrl.endsWith('sdk'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk .',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    type: ValidationState.Success,
  };
};
