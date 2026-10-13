import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { SOURCE_ONLY_PROVIDER_TYPES } from 'src/providers/utils/helpers/getIsTarget';

import { enumToTuple } from '@components/common/FilterGroup/helpers';
import {
  COMPACT_COLUMN_WIDTH,
  MEDIUM_COLUMN_WIDTH,
  REGULAR_COLUMN_WIDTH,
  WIDE_COLUMN_WIDTH,
} from '@components/common/TableView/columnWidthConstants';
import type { ResourceField } from '@components/common/utils/types';
import type { ProviderType } from '@forklift-ui/types';
import { PROVIDERS } from '@utils/enums';
import { t } from '@utils/i18n';
import type { ProviderData } from '@utils/providers/types';
import { ProviderStatus } from '@utils/types';

import { getProviderStorageCount } from './getProviderStorageCount';

export const providerFields: ResourceField[] = [
  {
    defaultWidth: WIDE_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.provider.metadata.name',
    label: t('Name'),
    resourceFieldId: ProvidersResourceFieldId.Name,
    sortable: true,
  },
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Filter by project'),
      type: 'freetext',
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.provider.metadata.namespace',
    label: t('Project'),
    resourceFieldId: ProvidersResourceFieldId.Namespace,
    sortable: true,
  },
  {
    defaultWidth: REGULAR_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Status'),
      primary: true,
      type: 'enum',
      values: enumToTuple(ProviderStatus),
    },
    isVisible: true,
    jsonPath: '$.provider.status.phase',
    label: t('Status'),
    resourceFieldId: ProvidersResourceFieldId.Phase,
    sortable: true,
  },
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Filter by endpoint'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.provider.spec.url',
    label: t('Endpoint'),
    resourceFieldId: ProvidersResourceFieldId.Url,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    filter: {
      groups: [
        { groupId: 'target', label: t('Target and source') },
        { groupId: 'source', label: t('Source only') },
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
    resourceFieldId: ProvidersResourceFieldId.Type,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: '$.inventory.vmCount',
    label: t('VMs'),
    resourceFieldId: ProvidersResourceFieldId.VmCount,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: '$.inventory.networkCount',
    label: t('Networks'),
    resourceFieldId: ProvidersResourceFieldId.NetworkCount,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: false,
    jsonPath: '$.inventory.clusterCount',
    label: t('Clusters'),
    resourceFieldId: ProvidersResourceFieldId.ClusterCount,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: '$.inventory.hostCount',
    label: t('Hosts'),
    resourceFieldId: ProvidersResourceFieldId.HostCount,
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: false,
    jsonPath: (provider: ProviderData) => getProviderStorageCount(provider),
    label: t('Storage'),
    resourceFieldId: ProvidersResourceFieldId.StorageCount,
    sortable: true,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: ProvidersResourceFieldId.Actions,
    sortable: false,
  },
];
