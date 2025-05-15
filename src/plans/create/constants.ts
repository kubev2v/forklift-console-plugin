import { createContext } from 'react';

import type { WizardStepType } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import type { CreatePlanWizardContextProps } from './types';

export enum PlanWizardStepId {
  BasicSetup = 'basic-setup',
  General = 'general',
  VirtualMachines = 'virtual-machines',
  NetworkMap = 'network-map',
  StorageMap = 'storage-map',
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
  [PlanWizardStepId.NetworkMap]: t('Network map'),
  [PlanWizardStepId.OtherSettings]: t('Other settings (optional)'),
  [PlanWizardStepId.ReviewAndCreate]: t('Review and create'),
  [PlanWizardStepId.StorageMap]: t('Storage map'),
  [PlanWizardStepId.VirtualMachines]: t('Virtual machines'),
};

export const planStepOrder: Record<PlanWizardStepId, number> = {
  [PlanWizardStepId.AdditionalSetup]: 7,
  [PlanWizardStepId.BasicSetup]: 1,
  [PlanWizardStepId.General]: 2,
  [PlanWizardStepId.Hooks]: 9,
  [PlanWizardStepId.MigrationType]: 6,
  [PlanWizardStepId.NetworkMap]: 4,
  [PlanWizardStepId.OtherSettings]: 8,
  [PlanWizardStepId.ReviewAndCreate]: 10,
  [PlanWizardStepId.StorageMap]: 5,
  [PlanWizardStepId.VirtualMachines]: 3,
};

export const firstStep: WizardStepType = {
  id: PlanWizardStepId.General,
  index: planStepOrder[PlanWizardStepId.General],
  name: PlanWizardStepId.General,
  parentId: PlanWizardStepId.BasicSetup,
};

export const CreatePlanWizardContext = createContext({} as CreatePlanWizardContextProps);
