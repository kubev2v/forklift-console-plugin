import { ProvidersResourceFieldId } from 'src/providers/utils/constants';

import type { ProviderType } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import { enumToTuple } from '../../../components/common/FilterGroup/helpers';
import type { ResourceField } from '../../../components/common/utils/types';
import { SOURCE_ONLY_PROVIDER_TYPES } from '../../../modules/Providers/utils/helpers/getIsTarget';
import type { ProviderData } from '../../../modules/Providers/utils/types/ProviderData';
import { PROVIDERS } from '../../../utils/enums';
import { ProviderStatus } from '../../../utils/types';

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
      resourceFieldId: ProvidersResourceFieldId.Name,
      sortable: true,
    },
    {
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
      isVisible: true,
      jsonPath: '$.inventory.vmCount',
      label: t('VMs'),
      resourceFieldId: ProvidersResourceFieldId.VmCount,
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.inventory.networkCount',
      label: t('Networks'),
      resourceFieldId: ProvidersResourceFieldId.NetworkCount,
      sortable: true,
    },
    {
      isVisible: false,
      jsonPath: '$.inventory.clusterCount',
      label: t('Clusters'),
      resourceFieldId: ProvidersResourceFieldId.ClusterCount,
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.inventory.hostCount',
      label: t('Hosts'),
      resourceFieldId: ProvidersResourceFieldId.HostCount,
      sortable: true,
    },
    {
      isVisible: false,
      jsonPath: (provider) => getProviderStorageCount(provider as ProviderData),
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
};
