import { t } from '@utils/i18n';

export const networkNameTemplateAllowedVariables = [
  t(
    '- .NetworkName: If target network is multus, name of the Multus network attachment definition, empty otherwise.',
  ),
  t(
    '- .NetworkNamespace: If target network is multus, namespace where the network attachment definition is located.',
  ),
  t('- .NetworkType: type of the network ("Multus" or "Default")'),
  t('- .NetworkIndex: sequential index of the network interface (0-based)'),
];

export const networkNameTemplateHelperExamples = [
  '"net-{{.NetworkIndex}}"',
  '"{{if eq .NetworkType "pod"}}pod{{else}}multus-{{.NetworkIndex}}{{end}}"',
];
