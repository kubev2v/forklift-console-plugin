import { t } from '@utils/i18n';

export const TargetPowerStates = {
  AUTO: 'auto',
  OFF: 'off',
  ON: 'on',
} as const;

export type TargetPowerStateValue = (typeof TargetPowerStates)[keyof typeof TargetPowerStates];

export type TargetPowerState = {
  description?: string;
  label: string;
  value: TargetPowerStateValue;
};

export const defaultTargetPowerStateOption: TargetPowerState = {
  description: t('Retain source VM power state'),
  label: t('Auto'),
  value: TargetPowerStates.AUTO,
};

export const targetPowerStateOptions: TargetPowerState[] = [
  defaultTargetPowerStateOption,
  {
    label: t('Powered on'),
    value: TargetPowerStates.ON,
  },
  {
    label: t('Powered off'),
    value: TargetPowerStates.OFF,
  },
];

export const getTargetPowerStateLabel = (value: TargetPowerStateValue): string => {
  const found = targetPowerStateOptions.find((option) => option.value === value);
  return found ? found.label : value;
};
