import type { ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';
import type { WizardStepType } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import type { GeneralFormFieldId } from './steps/general-information/constants';
import type { VmFormFieldId } from './steps/virtual-machines/constants';

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
  [PlanWizardStepId.AdditionalSetup]: t('Additional setup'),
  [PlanWizardStepId.BasicSetup]: t('Basic setup'),
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
  [PlanWizardStepId.AdditionalSetup]: 7,
  [PlanWizardStepId.BasicSetup]: 1,
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
  parentId: PlanWizardStepId.BasicSetup,
};

export type CreatePlanFormValues = {
  [GeneralFormFieldId.PlanName]: string;
  [GeneralFormFieldId.PlanProject]: string;
  [GeneralFormFieldId.SourceProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProject]: string;
  [VmFormFieldId.Vms]: Record<string, ProviderVirtualMachine[]>;
};

export enum ProviderType {
  Openshift = 'openshift',
  Openstack = 'openstack',
  Ova = 'ova',
  Ovirt = 'ovirt',
  Vsphere = 'vsphere',
}
