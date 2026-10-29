import type { TargetPowerStateValue } from '@utils/plans/constants';

export type EditVmWizardFormValues = {
  excludeDisks: string[];
  instanceType: string | undefined;
  migrateSharedDisks: boolean | undefined;
  networkNameTemplate: string | undefined;
  pvcNameTemplate: string | undefined;
  targetName: string;
  targetPowerState: TargetPowerStateValue;
  volumeNameTemplate: string | undefined;
};
