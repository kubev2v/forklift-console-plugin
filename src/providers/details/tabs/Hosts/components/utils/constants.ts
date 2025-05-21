import { t } from '@utils/i18n';

export const hostsFields = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.inventory.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by network'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.networkAdapter.name',
    label: t('Network for data transfer'),
    resourceFieldId: 'network',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.networkAdapter.linkSpeed',
    label: t('Bandwidth'),
    resourceFieldId: 'linkSpeed',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.networkAdapter.mtu',
    label: t('MTU'),
    resourceFieldId: 'mtu',
    sortable: true,
  },
];

export enum VSphereEndpointType {
  ESXi = 'esxi',
}
