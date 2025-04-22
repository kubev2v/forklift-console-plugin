import { t } from '@utils/i18n';

export const getVolumeNameTemplateAllowedVariables = () => [
  t('- .PVCName: name of the PVC mounted to the VM using this volume'),
  t('- .VolumeIndex: sequential index of the volume interface (0-based)'),
];
export const volumeNameTemplateHelperExamples = ['"disk-{{.VolumeIndex}}"', '"pvc-{{.PVCName}}"'];
