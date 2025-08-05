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
