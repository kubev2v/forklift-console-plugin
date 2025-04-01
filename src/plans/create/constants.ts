import type { WizardStepType } from '@patternfly/react-core';
import { t } from '@utils/i18n';

export enum PlanWizardStepId {
  BasicSetUp = 'basic-set-up',
  General = 'general',
  VirtualMachines = 'virtual-machines',
  NetworkMapping = 'network-mapping',
  StorageMapping = 'storage-mapping',
  MigrationType = 'migration-type',
  AdditionalSetUp = 'additional-set-up',
  OtherSettings = 'other-settings',
  Hooks = 'hooks',
  ReviewAndCreate = 'review-and-create',
}

export const planStepNames: Record<PlanWizardStepId, string> = {
  [PlanWizardStepId.AdditionalSetUp]: t('Additional set up'),
  [PlanWizardStepId.BasicSetUp]: t('Basic set up'),
  [PlanWizardStepId.General]: t('General'),
  [PlanWizardStepId.Hooks]: t('Hooks (optional)'),
  [PlanWizardStepId.MigrationType]: t('Migration type'),
  [PlanWizardStepId.NetworkMapping]: t('Network mapping'),
  [PlanWizardStepId.OtherSettings]: t('Other settings (optional)'),
  [PlanWizardStepId.ReviewAndCreate]: t('Review and create'),
  [PlanWizardStepId.StorageMapping]: t('Storage mapping'),
  [PlanWizardStepId.VirtualMachines]: t('Virtual machines'),
};

export const planStepOrder: Record<PlanWizardStepId, number> = {
  [PlanWizardStepId.AdditionalSetUp]: 7,
  [PlanWizardStepId.BasicSetUp]: 1,
  [PlanWizardStepId.General]: 2,
  [PlanWizardStepId.Hooks]: 9,
  [PlanWizardStepId.MigrationType]: 6,
  [PlanWizardStepId.NetworkMapping]: 4,
  [PlanWizardStepId.OtherSettings]: 8,
  [PlanWizardStepId.ReviewAndCreate]: 10,
  [PlanWizardStepId.StorageMapping]: 5,
  [PlanWizardStepId.VirtualMachines]: 3,
};

export const firstStep: WizardStepType = {
  id: PlanWizardStepId.General,
  index: planStepOrder[PlanWizardStepId.General],
  name: PlanWizardStepId.General,
  parentId: PlanWizardStepId.BasicSetUp,
};
