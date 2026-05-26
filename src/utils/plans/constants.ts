export const TargetPowerStates = {
  AUTO: 'auto',
  OFF: 'off',
  ON: 'on',
} as const;

export type TargetPowerStateValue =
  | (typeof TargetPowerStates)[keyof typeof TargetPowerStates]
  | undefined;
