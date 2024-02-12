import { validateNFSMount, ValidationMsg } from '../../common';

export const validateOvaNfsPath = (url: string | number): ValidationMsg => {
  // Sanity check
  if (typeof url !== 'string') {
    return { type: 'error', msg: 'URL is not a string' };
  }

  const trimmedUrl: string = url.toString().trim();
  const isValidURL = validateNFSMount(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'error',
      msg: 'The NFS shared directory is required. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The NFS shared directory format is invalid. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
    };
  }

  return {
    type: 'success',
    msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
  };
};
