import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceFieldFactory } from '@components/common/utils/types';
import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  V1beta1NetworkMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { NetworkMapsAddButton } from '../../components';
import NetworkMapsEmptyState from '../../components/NetworkMapsEmptyState';
import { getNetworkMapPhase, NETWORK_MAP_STATUS, NetworkMapData } from '../../utils';
import NetworkMapRow from './NetworkMapRow';

import './NetworkMapsListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.obj.metadata.name',
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
    jsonPath: '$.obj.metadata.namespace',
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
    jsonPath: getNetworkMapPhase,
    label: t('Status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Status'),
      values: EnumToTuple(NETWORK_MAP_STATUS),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'source',
    jsonPath: '$.obj.spec.provider.source.name',
    label: t('Source provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by source'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'destination',
    jsonPath: '$.obj.spec.provider.destination.name',
    label: t('Target provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by target'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'owner',
    jsonPath: '$.obj.metadata.ownerReferences[0].name',
    label: t('Owner'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by namespace'),
    },
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

const NetworkMapsListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'NetworkMaps' });

  const [networkMaps, networkMapsLoaded, networkMapsLoadError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: NetworkMapModel,
    namespace,
  });

  const data: NetworkMapData[] = networkMaps.map((obj) => ({
    obj,
    permissions,
  }));

  const EmptyState = (
    <EmptyState_
      AddButton={
        <NetworkMapsAddButton
          namespace={namespace}
          dataTestId="add-network-map-button-empty-state"
        />
      }
      namespace={namespace}
    />
  );

  return (
    <StandardPage<NetworkMapData>
      data-testid="network-maps-list"
      addButton={
        permissions.canCreate && (
          <NetworkMapsAddButton namespace={namespace} dataTestId="add-network-map-button" />
        )
      }
      dataSource={[data || [], networkMapsLoaded, networkMapsLoadError]}
      RowMapper={NetworkMapRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('NetworkMaps')}
      userSettings={userSettings}
      customNoResultsFound={EmptyState}
      page={1}
    />
  );
};

interface EmptyStateProps {
  AddButton: JSX.Element;
  namespace?: string;
}

const EmptyState_: React.FC<EmptyStateProps> = ({ namespace }) => {
  return <NetworkMapsEmptyState namespace={namespace} />;
};

export default NetworkMapsListPage;
