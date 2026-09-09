import { t } from '@utils/i18n';

export const validateSettingsNumberInput = (value: number | undefined, min = 0): true | string => {
  const num = Number(value);
  if (isNaN(num) || num < min || !Number.isInteger(num)) {
    return t(
      'Not a valid input. The value must be a whole number greater or equal to {{min}}. Reverting back to default.',
      { min },
    );
  }
  return true;
};
