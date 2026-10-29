import { t } from '@utils/i18n';

export const EDIT_VM_NAME_TEMPLATE_EXAMPLE_EXPRESSION = {
  networkNameTemplate: '{{.NetworkName}}',
  pvcNameTemplate: '{{.VmName}}',
  volumeNameTemplate: '{{.VolumeIndex}}',
} as const;

export const EditVmWizardStepId = {
  Disks: 'edit-vm-disks',
  General: 'edit-vm-general',
  NamingTemplates: 'edit-vm-naming-templates',
  Review: 'edit-vm-review',
} as const;

export type EditVmWizardStepId = (typeof EditVmWizardStepId)[keyof typeof EditVmWizardStepId];

export const editVmWizardStepNames: Record<EditVmWizardStepId, string> = {
  [EditVmWizardStepId.Disks]: t('Disks'),
  [EditVmWizardStepId.General]: t('General'),
  [EditVmWizardStepId.NamingTemplates]: t('Naming templates'),
  [EditVmWizardStepId.Review]: t('Review changes'),
};

export const editVmWizardStepDescriptions: Record<EditVmWizardStepId, string> = {
  [EditVmWizardStepId.Disks]: t('Select which disks to migrate and how to handle shared disks.'),
  [EditVmWizardStepId.General]: t(
    'Configure the VM name, power state and compute resource after migration.',
  ),
  [EditVmWizardStepId.NamingTemplates]: t(
    'Customize names generated for resources created for this VM. VM overrides take precedence over plan settings.',
  ),
  [EditVmWizardStepId.Review]: t(
    'Review the settings for {{vmName}}. Changes apply only to this VM.',
  ),
};
