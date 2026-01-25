import { validateContainerImage } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateVDDKImage = (vddkImage?: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (vddkImage === undefined)
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: ValidationState.Default,
    };

  // Sanity check
  if (typeof vddkImage !== 'string') {
    return { msg: 'VDDK image is not a string', type: ValidationState.Error };
  }

  const trimmedVddkImage: string = vddkImage.trim();
  const isValidTrimmedVddkImage = validateContainerImage(trimmedVddkImage);

  if (trimmedVddkImage === '')
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: ValidationState.Error,
    };

  if (!isValidTrimmedVddkImage) {
    return {
      msg: 'The VDDK image is invalid. VDDK image should be a valid container image in the format of <registry_route_or_server_path>/vddk:<tag> .',
      type: ValidationState.Error,
    };
  }

  return {
    msg: 'VMware Virtual Disk Development Kit (VDDK) image in the format of <registry_route_or_server_path>/vddk:<tag> .',
    type: ValidationState.Success,
  };
};
