import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateNFSMount } from '../../common';

export const validateOvaNfsPath = (url: string | number | undefined): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: ValidationState.Error };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateNFSMount(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The NFS shared directory is required. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
      type: ValidationState.Error,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The NFS shared directory format is invalid. The endpoint should include an IP or URL and a path, for example: 10.10.0.10:/ova .',
      type: ValidationState.Error,
    };
  }

  return {
    msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
    type: ValidationState.Success,
  };
};
