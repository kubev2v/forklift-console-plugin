import type { TFunction } from 'react-i18next';

export const getVolumeNameTemplateAllowedVariables = (
  t: TFunction<'plugin__forklift-console-plugin'>,
) => [
  t('- .PVCName: name of the PVC mounted to the VM using this volume'),
  t('- .VolumeIndex: sequential index of the volume interface (0-based)'),
];
export const volumeNameTemplateHelperExamples = ['"disk-{{.VolumeIndex}}"', '"pvc-{{.PVCName}}"'];
