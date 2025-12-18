import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';

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

export const validateVddkInitImage = (value: string | undefined): string | true => {
  const result = validateVDDKImage(value);

  if (result.type === ValidationState.Error && typeof result.msg === 'string') {
    return result.msg;
  }

  return true;
};
