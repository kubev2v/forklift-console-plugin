import type { WizardStepType } from '@patternfly/react-core';
import { t } from '@utils/i18n';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { V1beta1Provider } from '@kubev2v/types';

export enum PlanWizardStepId {
  BasicSetup = 'basic-setup',
  General = 'general',
  VirtualMachines = 'virtual-machines',
  NetworkMapping = 'network-mapping',
  StorageMapping = 'storage-mapping',
  MigrationType = 'migration-type',
  AdditionalSetup = 'additional-setup',
  OtherSettings = 'other-settings',
  Hooks = 'hooks',
  ReviewAndCreate = 'review-and-create',
}

export const planStepNames: Record<PlanWizardStepId, ReturnType<typeof t>> = {
  [PlanWizardStepId.BasicSetup]: t('Basic setup'),
  [PlanWizardStepId.General]: t('General'),
  [PlanWizardStepId.VirtualMachines]: t('Virtual machines'),
  [PlanWizardStepId.NetworkMapping]: t('Network mapping'),
  [PlanWizardStepId.StorageMapping]: t('Storage mapping'),
  [PlanWizardStepId.MigrationType]: t('Migration type'),
  [PlanWizardStepId.AdditionalSetup]: t('Additional setup'),
  [PlanWizardStepId.OtherSettings]: t('Other settings (optional)'),
  [PlanWizardStepId.Hooks]: t('Hooks (optional)'),
  [PlanWizardStepId.ReviewAndCreate]: t('Review and create'),
};

export const planStepOrder: Record<PlanWizardStepId, number> = {
  [PlanWizardStepId.BasicSetup]: 1,
  [PlanWizardStepId.General]: 2,
  [PlanWizardStepId.VirtualMachines]: 3,
  [PlanWizardStepId.NetworkMapping]: 4,
  [PlanWizardStepId.StorageMapping]: 5,
  [PlanWizardStepId.MigrationType]: 6,
  [PlanWizardStepId.AdditionalSetup]: 7,
  [PlanWizardStepId.OtherSettings]: 8,
  [PlanWizardStepId.Hooks]: 9,
  [PlanWizardStepId.ReviewAndCreate]: 10,
};

export const firstStep: WizardStepType = {
  id: PlanWizardStepId.General,
  parentId: PlanWizardStepId.BasicSetup,
  name: PlanWizardStepId.General,
  index: planStepOrder[PlanWizardStepId.General],
};

export type CreatePlanFormValues = {
  [GeneralFormFieldId.PlanName]: string;
  [GeneralFormFieldId.PlanProject]: string;
  [GeneralFormFieldId.SourceProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProject]: string;
};
