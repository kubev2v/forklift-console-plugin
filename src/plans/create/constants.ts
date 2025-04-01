import { WizardStepType } from '@patternfly/react-core';
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
  [PlanWizardStepId.BasicSetUp]: t('Basic set up'),
  [PlanWizardStepId.General]: t('General'),
  [PlanWizardStepId.VirtualMachines]: t('Virtual machines'),
  [PlanWizardStepId.NetworkMapping]: t('Network mapping'),
  [PlanWizardStepId.StorageMapping]: t('Storage mapping'),
  [PlanWizardStepId.MigrationType]: t('Migration type'),
  [PlanWizardStepId.AdditionalSetUp]: t('Additional set up'),
  [PlanWizardStepId.OtherSettings]: t('Other settings (optional)'),
  [PlanWizardStepId.Hooks]: t('Hooks (optional)'),
  [PlanWizardStepId.ReviewAndCreate]: t('Review and create'),
};

export const planStepOrder: Record<PlanWizardStepId, number> = {
  [PlanWizardStepId.BasicSetUp]: 1,
  [PlanWizardStepId.General]: 2,
  [PlanWizardStepId.VirtualMachines]: 3,
  [PlanWizardStepId.NetworkMapping]: 4,
  [PlanWizardStepId.StorageMapping]: 5,
  [PlanWizardStepId.MigrationType]: 6,
  [PlanWizardStepId.AdditionalSetUp]: 7,
  [PlanWizardStepId.OtherSettings]: 8,
  [PlanWizardStepId.Hooks]: 9,
  [PlanWizardStepId.ReviewAndCreate]: 10,
};

export const firstStep: WizardStepType = {
  id: PlanWizardStepId.General,
  parentId: PlanWizardStepId.BasicSetUp,
  name: PlanWizardStepId.General,
  index: planStepOrder[PlanWizardStepId.General],
};
