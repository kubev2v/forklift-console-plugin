import type { ProviderType } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import { enumToTuple } from '../../../components/common/FilterGroup/helpers';
import type { ResourceField } from '../../../components/common/utils/types';
import { SOURCE_ONLY_PROVIDER_TYPES } from '../../../modules/Providers/utils/helpers/getIsTarget';
import type { ProviderData } from '../../../modules/Providers/utils/types/ProviderData';
import { PROVIDERS } from '../../../utils/enums';
import { ProviderStatus } from '../../../utils/types';

import { ProvidersTableResourceFieldId } from './constants';
import { getProviderStorageCount } from './getProviderStorageCount';

export const providerFields = (): ResourceField[] => {
  const { t } = useForkliftTranslation();

  return [
    {
      filter: {
        placeholderLabel: t('Filter by name'),
        type: 'freetext',
      },
      isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
      isVisible: true,
      jsonPath: '$.provider.metadata.name',
      label: t('Name'),
      resourceFieldId: ProvidersTableResourceFieldId.Name,
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
      resourceFieldId: ProvidersTableResourceFieldId.Namespace,
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
      resourceFieldId: ProvidersTableResourceFieldId.Phase,
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
      resourceFieldId: ProvidersTableResourceFieldId.Url,
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
      resourceFieldId: ProvidersTableResourceFieldId.Type,
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.inventory.vmCount',
      label: t('VMs'),
      resourceFieldId: ProvidersTableResourceFieldId.VmCount,
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.inventory.networkCount',
      label: t('Networks'),
      resourceFieldId: ProvidersTableResourceFieldId.NetworkCount,
      sortable: true,
    },
    {
      isVisible: false,
      jsonPath: '$.inventory.clusterCount',
      label: t('Clusters'),
      resourceFieldId: ProvidersTableResourceFieldId.ClusterCount,
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.inventory.hostCount',
      label: t('Hosts'),
      resourceFieldId: ProvidersTableResourceFieldId.HostCount,
      sortable: true,
    },
    {
      isVisible: false,
      jsonPath: (provider) => getProviderStorageCount(provider as ProviderData),
      label: t('Storage'),
      resourceFieldId: ProvidersTableResourceFieldId.StorageCount,
      sortable: true,
    },
    {
      isAction: true,
      isVisible: true,
      label: '',
      resourceFieldId: ProvidersTableResourceFieldId.Actions,
      sortable: false,
    },
  ];
};
