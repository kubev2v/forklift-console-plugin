import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router';
import StandardPage from 'src/components/page/StandardPage';
import cloudNative from 'src/modules/Providers/images/cloudNative.svg';
import {
  getResourceUrl,
  ProviderData,
  SOURCE_ONLY_PROVIDER_TYPES,
} from 'src/modules/Providers/utils';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EnumToTuple, loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import {
  ProviderModel,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  ProviderType,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { useGetDeleteAndEditAccessReview, useProvidersInventoryList } from '../../hooks';
import { findInventoryByID } from '../../utils';

import { ProvidersEmptyState } from './components';
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
    jsonPath: '$.inventory.storageCount',
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
  const history = useHistory();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'Providers' }));

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
  } = useProvidersInventoryList({});

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data: ProviderData[] = providers.map((provider) => ({
    provider,
    inventory: findInventoryByID(inventory, provider.metadata?.uid),
    permissions,
  }));

  const providersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
    namespaced: namespace ? true : false,
  });

  const AddButton = (
    <Button
      data-testid="add-provider-button"
      variant="primary"
      onClick={() => history.push(`${providersListURL}/~new`)}
    >
      {t('Create Provider')}
    </Button>
  );

  const CloudNative = () => <img src={cloudNative} className="forklift-empty-state__icon" />;

  const EmptyState = (
    <ProvidersEmptyState
      AddButton={AddButton}
      title={
        namespace ? (
          <Trans t={t} ns="plugin__forklift-console-plugin">
            No Providers found in namespace <strong>{namespace}</strong>.
          </Trans>
        ) : (
          t('No providers found')
        )
      }
      Icon={CloudNative}
    />
  );

  const inventoryNotReachable = (
    <Alert title={t('Inventory')} variant="warning">
      <TextContent>
        <Text component={TextVariants.p}>
          {t(
            'Inventory server is not reachable. To troubleshoot, check the Forklift controller pod logs.',
          )}
        </Text>
      </TextContent>
    </Alert>
  );

  return (
    <StandardPage<ProviderData>
      data-testid="providers-list"
      addButton={AddButton}
      dataSource={[data || [], providersLoaded, providersLoadError]}
      RowMapper={ProviderRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Providers')}
      userSettings={userSettings}
      alerts={!inventoryLoading && inventoryError ? [inventoryNotReachable] : undefined}
      customNoResultsFound={EmptyState}
    />
  );
};

export default ProvidersListPage;
