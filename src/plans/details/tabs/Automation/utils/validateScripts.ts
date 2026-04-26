import { t } from '@utils/i18n';

export const validateScriptContent = (value: string): string | undefined => {
  if (!value?.trim()) return t('Script content is required.');

  return undefined;
};
