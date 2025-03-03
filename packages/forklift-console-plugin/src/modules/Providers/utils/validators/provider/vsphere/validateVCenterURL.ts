import { pki } from 'node-forge';

import { safeBase64Decode } from '../../../helpers';
import { validateIpv4, validateURL, ValidationMsg } from '../../common';

export const urlMatchesCertFqdn = (urlHostname: string, caCert: string): boolean => {
  try {
    const decodedCaCert = safeBase64Decode(caCert);
    const cert = pki.certificateFromPem(decodedCaCert);
    const dnsAltName = cert.extensions
      .find((ext) => ext.name === 'subjectAltName')
      ?.altNames.find((altName) => altName.type === 2)?.value;
    const commonName = cert.subject.attributes.find((attr) => attr.name === 'commonName')?.value;

    return urlHostname === (dnsAltName || commonName);
  } catch (e) {
    console.error('Unable to parse certificate object from PEM.');
  }

  return false;
};

export const validateVCenterURL = (url: string, caCert?: string): ValidationMsg => {
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

  if (urlObject?.protocol === 'https:') {
    if (validateIpv4(urlHostname)) {
      return {
        type: 'error',
        msg: 'Invalid URL. The URL must be a fully qualified domain name (FQDN).',
      };
    }

    if (caCert && !urlMatchesCertFqdn(urlHostname, caCert)) {
      return {
        type: 'error',
        msg: 'Invalid URL. The URL must be a fully qualified domain name (FQDN) and match the FQDN in the certificate you uploaded.',
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
