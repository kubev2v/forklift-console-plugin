import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ResourceFieldFactory } from '@components/common/utils/types';
import {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  ProviderModel,
  ProviderModelGroupVersionKind,
  ProviderType,
  V1beta1Provider,
  VSphereProvider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import InventoryNotReachable from './components/InventoryNotReachable';
import ProvidersAddButton from './components/ProvidersAddButton';
import ProvidersEmptyState from './components/ProvidersEmptyState';
import useGetDeleteAndEditAccessReview from '../../hooks/useGetDeleteAndEditAccessReview';
import useProvidersInventoryList from '../../hooks/useProvidersInventoryList';
import modernizeMigration from '../../images/modernizeMigration.svg';
import { findInventoryByID } from '../../utils/helpers/findInventoryByID';
import { SOURCE_ONLY_PROVIDER_TYPES } from '../../utils/helpers/getIsTarget';
import { ProviderData } from '../../utils/types/ProviderData';
import ProviderRow from './ProviderRow';

import './ProvidersListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.provider.metadata.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'namespace',
    jsonPath: '$.provider.metadata.namespace',
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by namespace'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'phase',
    jsonPath: '$.provider.status.phase',
    label: t('Status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Status'),
      values: EnumToTuple(PROVIDER_STATUS),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'url',
    jsonPath: '$.provider.spec.url',
    label: t('Endpoint'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by endpoint'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'type',
    jsonPath: '$.provider.spec.type',
    label: t('Type'),
    isVisible: true,
    filter: {
      type: 'groupedEnum',
      primary: true,
      placeholderLabel: t('Type'),
      values: EnumToTuple(PROVIDERS).map(({ id, ...rest }) => ({
        id,
        groupId: SOURCE_ONLY_PROVIDER_TYPES.includes(id as ProviderType) ? 'source' : 'target',
        ...rest,
      })),
      groups: [
        { groupId: 'target', label: t('Target and Source') },
        { groupId: 'source', label: t('Source Only') },
      ],
    },
    sortable: true,
  },
  {
    resourceFieldId: 'vmCount',
    jsonPath: '$.inventory.vmCount',
    label: t('VMs'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'networkCount',
    jsonPath: '$.inventory.networkCount',
    label: t('Networks'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'clusterCount',
    jsonPath: '$.inventory.clusterCount',
    label: t('Clusters'),
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldId: 'hostCount',
    jsonPath: '$.inventory.hostCount',
    label: t('Hosts'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'storageCount',
    jsonPath: (obj: ProviderData) => {
      let storageCount: number;
      const { inventory } = obj;

      switch (inventory?.type) {
        case 'ova':
          storageCount = (inventory as OvaProvider).storageCount;
          break;
        case 'openshift':
          storageCount = (inventory as OpenshiftProvider).storageClassCount;
          break;
        case 'vsphere':
          storageCount = (inventory as VSphereProvider).datastoreCount;
          break;
        case 'openstack':
          storageCount = (inventory as OpenstackProvider).volumeTypeCount;
          break;
        case 'ovirt':
          storageCount = (inventory as OVirtProvider).storageDomainCount;
          break;
      }

      return storageCount;
    },
    label: t('Storage'),
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldId: 'actions',
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
];

const ProvidersListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Providers' });

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  const {
    inventory,
    loading: inventoryLoading,
    error: inventoryError,
  } = useProvidersInventoryList({ namespace });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data: ProviderData[] = providers.map((provider) => ({
    provider,
    inventory: findInventoryByID(inventory, provider.metadata?.uid),
    permissions,
  }));

  const EmptyState = (
    <EmptyState_
      AddButton={<ProvidersAddButton dataTestId="add-provider-button-empty-state" />}
      namespace={namespace}
    />
  );

  return (
    <StandardPage<ProviderData>
      data-testid="providers-list"
      addButton={permissions.canCreate && <ProvidersAddButton dataTestId="add-provider-button" />}
      dataSource={[data || [], providersLoaded, providersLoadError]}
      RowMapper={ProviderRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Providers')}
      userSettings={userSettings}
      alerts={
        !inventoryLoading && inventoryError
          ? [<InventoryNotReachable key={'inventoryNotReachable'} />]
          : undefined
      }
      customNoResultsFound={EmptyState}
      page={1}
    />
  );
};

interface EmptyStateProps {
  AddButton: JSX.Element;
  namespace?: string;
}

const ModernizeMigration = () => (
  <img src={modernizeMigration} className="forklift-empty-state__icon" />
);

const EmptyState_: React.FC<EmptyStateProps> = ({ AddButton, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <ProvidersEmptyState
      AddButton={AddButton}
      title={
        namespace ? (
          <ForkliftTrans>
            No Providers found in namespace <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No providers found')
        )
      }
      Icon={ModernizeMigration}
    />
  );
};

export default ProvidersListPage;
