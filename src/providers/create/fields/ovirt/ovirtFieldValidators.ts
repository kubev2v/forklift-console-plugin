import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';

import { t } from '@utils/i18n';

export const validateOvirtUsername = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') {
    return t(
      'Username is required. The username usually includes @ character, for example: name@internal',
    );
  }

  if (!validateNoSpaces(value)) {
    return t('Invalid username, spaces are not allowed');
  }

  return undefined;
};

export const validateOvirtPassword = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') {
    return t('Password is required');
  }

  if (!validateNoSpaces(value)) {
    return t('Invalid password, spaces are not allowed');
  }

  return undefined;
};
