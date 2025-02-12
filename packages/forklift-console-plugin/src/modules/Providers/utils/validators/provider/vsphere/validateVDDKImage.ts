import { validateContainerImage, ValidationMsg } from '../../common';

export const validateVDDKImage = (vddkImage: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (vddkImage === undefined)
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: 'default',
    };

  // Sanity check
  if (typeof vddkImage !== 'string') {
    return { type: 'error', msg: 'VDDK image is not a string' };
  }

  const trimmedVddkImage: string = vddkImage.trim();
  const isValidTrimmedVddkImage = validateContainerImage(trimmedVddkImage);

  if (trimmedVddkImage === '')
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: 'error',
    };

  if (!isValidTrimmedVddkImage) {
    return {
      type: 'error',
      msg: 'The VDDK image is invalid. VDDK image should be a valid container image in the format of <registry_route_or_server_path>/vddk:<tag> .',
    };
  }

  return {
    type: 'success',
    msg: 'VMware Virtual Disk Development Kit (VDDK) image in the format of <registry_route_or_server_path>/vddk:<tag> .',
  };
};
