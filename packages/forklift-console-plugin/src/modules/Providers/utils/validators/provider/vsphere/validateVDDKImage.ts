import { validateContainerImage, ValidationMsg } from '../../common';

export const validateVDDKImage = (vddkImage: string | number): ValidationMsg => {
  // Sanity check
  if (typeof vddkImage !== 'string') {
    return { type: 'error', msg: 'VDDK image is not a string' };
  }

  const trimmedVddkImage: string = vddkImage.toString().trim();
  const isValidTrimmedVddkImage = validateContainerImage(trimmedVddkImage);

  if (trimmedVddkImage === '')
    return {
      msg: 'The VDDK image is empty, it is recommended to provide an image, for example: quay.io/kubev2v/vddk:latest .',
      type: 'warning',
    };

  if (!isValidTrimmedVddkImage) {
    return {
      type: 'error',
      msg: 'The VDDK image is invalid. VDDK image should be a valid container image, for example: quay.io/kubev2v/vddk:latest .',
    };
  }

  return {
    type: 'success',
    msg: 'VMware Virtual Disk Development Kit (VDDK) image, for example: quay.io/kubev2v/vddk:latest .',
  };
};
