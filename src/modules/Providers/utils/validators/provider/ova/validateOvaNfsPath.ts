import { validateNFSMount, type ValidationMsg } from '../../common';

export const validateOvaNfsPath = (url: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: 'error' };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateNFSMount(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The NFS shared directory is required. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
      type: 'error',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The NFS shared directory format is invalid. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
      type: 'error',
    };
  }

  return {
    msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
    type: 'success',
  };
};
