import type { ProviderType } from '@kubev2v/types';

import { enumToTuple } from '../../../components/common/FilterGroup/helpers';
import type { ResourceFieldFactory } from '../../../components/common/utils/types.ts';
import { SOURCE_ONLY_PROVIDER_TYPES } from '../../../modules/Providers/utils/helpers/getIsTarget';
import type { ProviderData } from '../../../modules/Providers/utils/types/ProviderData';
import { PROVIDERS } from '../../../utils/enums';
import { ProviderStatus } from '../../../utils/types';

import { getProviderStorageCount } from './getProviderStorageCount.ts';

export const providerFields: ResourceFieldFactory = (t) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.provider.metadata.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: 'freetext',
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.provider.metadata.namespace',
    label: t('Namespace'),
    resourceFieldId: 'namespace',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Status'),
      primary: true,
      type: 'enum',
      values: enumToTuple(ProviderStatus),
    },
    isVisible: true,
    jsonPath: '$.provider.status.phase',
    label: t('Status'),
    resourceFieldId: 'phase',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by endpoint'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.provider.spec.url',
    label: t('Endpoint'),
    resourceFieldId: 'url',
    sortable: true,
  },
  {
    filter: {
      groups: [
        { groupId: 'target', label: t('Target and Source') },
        { groupId: 'source', label: t('Source Only') },
      ],
      placeholderLabel: t('Type'),
      primary: true,
      type: 'groupedEnum',
      values: enumToTuple(PROVIDERS).map(({ id, ...rest }) => ({
        groupId: SOURCE_ONLY_PROVIDER_TYPES.includes(id as ProviderType) ? 'source' : 'target',
        id,
        ...rest,
      })),
    },
    isVisible: true,
    jsonPath: '$.provider.spec.type',
    label: t('Type'),
    resourceFieldId: 'type',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.inventory.vmCount',
    label: t('VMs'),
    resourceFieldId: 'vmCount',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.inventory.networkCount',
    label: t('Networks'),
    resourceFieldId: 'networkCount',
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.inventory.clusterCount',
    label: t('Clusters'),
    resourceFieldId: 'clusterCount',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.inventory.hostCount',
    label: t('Hosts'),
    resourceFieldId: 'hostCount',
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: (provider) => getProviderStorageCount(provider as ProviderData),
    label: t('Storage'),
    resourceFieldId: 'storageCount',
    sortable: true,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: 'actions',
    sortable: false,
  },
];
