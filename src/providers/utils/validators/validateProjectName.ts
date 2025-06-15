import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { t } from '@utils/i18n';

export const validateProjectName = (name: string | undefined): ValidationMsg => {
  if (!name) {
    return {
      msg: t(`Missing project name`),
      type: ValidationState.Error,
    };
  }

  return {
    msg: '',
    type: ValidationState.Default,
  };
};
