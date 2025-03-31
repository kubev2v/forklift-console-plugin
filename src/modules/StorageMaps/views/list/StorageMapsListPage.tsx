import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceFieldFactory } from '@components/common/utils/types';
import {
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { StorageMapsAddButton } from '../../components';
import StorageMapsEmptyState from '../../components/StorageMapsEmptyState';
import { getStorageMapPhase, STORAGE_MAP_STATUS, type StorageMapData } from '../../utils';

import StorageMapRow from './StorageMapRow';

import './StorageMapsListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.obj.metadata.name',
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
    jsonPath: '$.obj.metadata.namespace',
    label: t('Namespace'),
    resourceFieldId: 'namespace',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Status'),
      primary: true,
      type: 'enum',
      values: EnumToTuple(STORAGE_MAP_STATUS),
    },
    isVisible: true,
    jsonPath: getStorageMapPhase,
    label: t('Status'),
    resourceFieldId: 'phase',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by source'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.obj.spec.provider.source.name',
    label: t('Source provider'),
    resourceFieldId: 'source',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by target'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.obj.spec.provider.destination.name',
    label: t('Target provider'),
    resourceFieldId: 'destination',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.obj.metadata.ownerReferences[0].name',
    label: t('Owner'),
    resourceFieldId: 'owner',
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

const StorageMapsListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'StorageMaps' });

  const [StorageMaps, StorageMapsLoaded, StorageMapsLoadError] = useK8sWatchResource<
    V1beta1StorageMap[]
  >({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: StorageMapModel,
    namespace,
  });

  const data: StorageMapData[] = StorageMaps.map((obj) => ({
    obj,
    permissions,
  }));

  const EmptyState = (
    <EmptyState_
      AddButton={
        <StorageMapsAddButton
          namespace={namespace}
          dataTestId="add-network-map-button-empty-state"
        />
      }
      namespace={namespace}
    />
  );

  return (
    <StandardPage<StorageMapData>
      data-testid="network-maps-list"
      addButton={
        permissions.canCreate && (
          <StorageMapsAddButton namespace={namespace} dataTestId="add-network-map-button" />
        )
      }
      dataSource={[data || [], StorageMapsLoaded, StorageMapsLoadError]}
      RowMapper={StorageMapRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('StorageMaps')}
      userSettings={userSettings}
      customNoResultsFound={EmptyState}
      page={1}
    />
  );
};

type EmptyStateProps = {
  AddButton: JSX.Element;
  namespace?: string;
};

const EmptyState_: React.FC<EmptyStateProps> = ({ namespace }) => {
  return <StorageMapsEmptyState namespace={namespace} />;
};

export default StorageMapsListPage;
