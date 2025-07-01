import { t } from '@utils/i18n';

export const pvcNameTemplateAllowedVariables = [
  t('- .VmName: name of the VM'),
  t('- .PlanName: name of the migration plan'),
  t('- .DiskIndex: initial volume index of the disk'),
  t('- .RootDiskIndex: index of the root disk'),
  t('- .Shared: true if the volume is shared by multiple VMs, false otherwise'),
];
export const pvcNameTemplateHelperExamples = [
  '"{{.VmName}}-disk-{{.DiskIndex}}"',
  '"{{if eq .DiskIndex .RootDiskIndex}}root{{else}}data{{end}}-{{.DiskIndex}}"',
];
