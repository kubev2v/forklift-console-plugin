import { createContext } from 'react';

import type { WizardStepType } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import { CustomScriptsFieldId } from './steps/customization-scripts/constants';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { AapFormFieldId, HooksFormFieldId } from './steps/migration-hooks/constants';
import { MigrationTypeFieldId } from './steps/migration-type/constants';
import { NetworkMapFieldId } from './steps/network-map/constants';
import { OtherSettingsFormFieldId } from './steps/other-settings/constants';
import { CreatePlanStorageMapFieldId } from './steps/storage-map/constants';
import { VmFormFieldId } from './steps/virtual-machines/constants';
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
  Automation = 'automation',
  Hooks = 'hooks',
  ReviewAndCreate = 'review-and-create',
}

export const planStepNames: Record<PlanWizardStepId, ReturnType<typeof t>> = {
  [PlanWizardStepId.AdditionalSetup]: t('Additional setup'),
  [PlanWizardStepId.Automation]: t('Automation (optional)'),
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
  [PlanWizardStepId.Automation]: 9,
  [PlanWizardStepId.BasicSetup]: 1,
  [PlanWizardStepId.General]: 2,
  [PlanWizardStepId.Hooks]: 10,
  [PlanWizardStepId.MigrationType]: 6,
  [PlanWizardStepId.NetworkMap]: 4,
  [PlanWizardStepId.OtherSettings]: 8,
  [PlanWizardStepId.ReviewAndCreate]: 11,
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

export const stepFieldMap: Record<PlanWizardStepId, string[]> = {
  [PlanWizardStepId.AdditionalSetup]: [],
  [PlanWizardStepId.Automation]: Object.values(CustomScriptsFieldId),
  [PlanWizardStepId.BasicSetup]: [],
  [PlanWizardStepId.General]: Object.values(GeneralFormFieldId),
  [PlanWizardStepId.Hooks]: [...Object.values(HooksFormFieldId), ...Object.values(AapFormFieldId)],
  [PlanWizardStepId.MigrationType]: Object.values(MigrationTypeFieldId),
  [PlanWizardStepId.NetworkMap]: Object.values(NetworkMapFieldId),
  [PlanWizardStepId.OtherSettings]: Object.values(OtherSettingsFormFieldId),
  [PlanWizardStepId.ReviewAndCreate]: [],
  [PlanWizardStepId.StorageMap]: Object.values(CreatePlanStorageMapFieldId),
  [PlanWizardStepId.VirtualMachines]: Object.values(VmFormFieldId),
};
