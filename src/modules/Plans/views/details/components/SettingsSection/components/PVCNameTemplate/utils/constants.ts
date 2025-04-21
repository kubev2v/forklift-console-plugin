import { t } from '@utils/i18n';

export const getPVCNameTemplateAllowedVariables = () => [
  t('- .VmName: name of the VM'),
  t('- .PlanName: name of the migration plan'),
  t('- .DiskIndex: initial volume index of the disk'),
  t('- .RootDiskIndex: index of the root disk'),
];
export const pvcNameTemplateHelperExamples = [
  '"{{.VmName}}-disk-{{.DiskIndex}}"',
  '"{{if eq .DiskIndex .RootDiskIndex}}root{{else}}data{{end}}-{{.DiskIndex}}"',
];
