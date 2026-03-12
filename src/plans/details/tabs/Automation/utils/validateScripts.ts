import { validateScriptName } from 'src/plans/create/steps/customization-scripts/utils';

import { t } from '@utils/i18n';

export const validateUniqueScriptName = (
  value: string,
  index: number,
  scriptNames: string[],
): string | undefined => {
  const nameError = validateScriptName(value);
  if (nameError) return nameError;

  const isDuplicate = scriptNames.some((name, i) => i !== index && name === value);
  if (isDuplicate) return t('Script name must be unique.');

  return undefined;
};

export const validateScriptContent = (value: string): string | undefined => {
  if (!value?.trim()) return t('Script content is required.');

  return undefined;
};
