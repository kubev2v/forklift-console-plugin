import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  type OpenshiftProvider,
  type OpenstackProvider,
  type OvaProvider,
  type OVirtProvider,
  ProviderModel,
  ProviderModelGroupVersionKind,
  type ProviderType,
  type V1beta1Provider,
  type VSphereProvider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import useGetDeleteAndEditAccessReview from '../../hooks/useGetDeleteAndEditAccessReview';
import useProvidersInventoryList from '../../hooks/useProvidersInventoryList';
import modernizeMigration from '../../images/modernizeMigration.svg';
import { findInventoryByID } from '../../utils/helpers/findInventoryByID';
import { SOURCE_ONLY_PROVIDER_TYPES } from '../../utils/helpers/getIsTarget';
import type { ProviderData } from '../../utils/types/ProviderData';

import InventoryNotReachable from './components/InventoryNotReachable';
import ProvidersAddButton from './components/ProvidersAddButton';
import ProvidersEmptyState from './components/ProvidersEmptyState';
import ProviderRow from './ProviderRow';

import './ProvidersListPage.style.css';

export const fieldsMetadata = [
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
      values: enumToTuple(PROVIDER_STATUS),
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
    jsonPath: (obj: ProviderData) => {
      const { inventory } = obj;
      if (!inventory) {
        return undefined;
      }
      switch (inventory.type) {
        case 'ova':
          return (inventory as OvaProvider).storageCount;
        case 'openshift':
          return (inventory as OpenshiftProvider).storageClassCount;
        case 'vsphere':
          return (inventory as VSphereProvider).datastoreCount;
        case 'openstack':
          return (inventory as OpenstackProvider).volumeTypeCount;
        case 'ovirt':
          return (inventory as OVirtProvider).storageDomainCount;
        default:
          return undefined;
      }
    },
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

const ProvidersListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Providers' });

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const {
    error: inventoryError,
    inventory,
    loading: inventoryLoading,
  } = useProvidersInventoryList({ namespace });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data: ProviderData[] = providers.map((provider) => ({
    inventory: findInventoryByID(inventory, provider.metadata?.uid),
    permissions,
    provider,
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
      fieldsMetadata={fieldsMetadata}
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

type EmptyStateProps = {
  AddButton: JSX.Element;
  namespace?: string;
};

const ModernizeMigration = () => (
  <img src={modernizeMigration} className="forklift-empty-state__icon" />
);

const EmptyState_: FC<EmptyStateProps> = ({ AddButton, namespace }) => {
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
