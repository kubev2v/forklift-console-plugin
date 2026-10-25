import { VddkSetupMode } from 'src/providers/utils/constants';
import { validateVDDKImage } from 'src/providers/utils/validators/provider/vsphere/validateVDDKImage';
import { validateNoSpaces } from 'src/utils/validation/common';

import { t } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

export const validateVsphereUsername = (value: string | undefined): string | true => {
  if (!value || value.trim() === '') {
    return t('Username is required');
  }

  if (!validateNoSpaces(value)) {
    return t('Invalid username, spaces are not allowed');
  }

  return true;
};

export const validateVspherePassword = (value: string | undefined): string | true => {
  if (!value || value.trim() === '') {
    return t('Password is required');
  }

  if (!validateNoSpaces(value)) {
    return t('Invalid password, spaces are not allowed');
  }

  return true;
};

export const validateVddkInitImage = (value: string | undefined): string | undefined => {
  const result = validateVDDKImage(value);

  if (result.type === ValidationState.Error && typeof result.msg === 'string') {
    return result.msg;
  }

  return undefined;
};

export const validateVsphereDiskTransfer = (
  mode: VddkSetupMode | undefined,
  image: string | undefined,
): string | undefined => {
  if (!mode) {
    return t('Disk transfer selection is required');
  }

  if (mode === VddkSetupMode.Manual || mode === VddkSetupMode.Upload) {
    if (!image?.trim()) {
      return t('VDDK image is required');
    }
    return validateVddkInitImage(image);
  }

  return undefined;
};
