import { validateContainerImage, ValidationMsg } from '../../common';

export const validateVDDKImage = (vddkImage: string | number): ValidationMsg => {
  // Sanity check
  if (typeof vddkImage !== 'string') {
    return { type: 'error', msg: 'VDDK image is not a string' };
  }

  const trimmedVddkImage: string = vddkImage.toString().trim();
  const isValidTrimmedVddkImage = validateContainerImage(trimmedVddkImage);

  if (!isValidTrimmedVddkImage) {
    return {
      type: 'error',
      msg: 'The VDDK image is invalid. VDDK image should be a valid container image, for example: quay.io/kubev2v/vddk:latest .',
    };
  }

  if (trimmedVddkImage === '')
    return {
      msg: 'The VDDK image is empty, it is recommended to provide an image, for example: quay.io/kubev2v/vddk:latest .',
      type: 'warning',
    };

  return {
    type: 'default',
    msg: 'VMware Virtual Disk Development Kit (VDDK) image, for example: quay.io/kubev2v/vddk:latest .',
  };
};
