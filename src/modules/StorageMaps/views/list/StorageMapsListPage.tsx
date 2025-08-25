import { type FC, useMemo } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import StorageMapsEmptyState from 'src/storageMaps/components/StorageMapsEmptyState';

import {
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import StorageMapsAddButton from '../../components/StorageMapsAddButton';
import { STORAGE_MAP_STATUS } from '../../utils/constants/storage-map-status';
import { getStorageMapPhase } from '../../utils/helpers/getStorageMapPhase';
import type { StorageMapData } from '../../utils/types/StorageMapData';

import StorageMapRow from './StorageMapRow';

import './StorageMapsListPage.style.css';

const fieldsMetadata = [
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
      values: enumToTuple(STORAGE_MAP_STATUS),
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

const StorageMapsListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const userSettings = useMemo(() => loadUserSettings({ pageId: 'StorageMaps' }), []);

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

  return (
    <StandardPage<StorageMapData>
      data-testid="network-maps-list"
      {...(permissions.canCreate && {
        addButton: <StorageMapsAddButton namespace={namespace} testId="add-storage-map-button" />,
      })}
      dataSource={[data || [], StorageMapsLoaded, StorageMapsLoadError]}
      RowMapper={StorageMapRow}
      fieldsMetadata={fieldsMetadata}
      namespace={namespace}
      title={t('Storage maps')}
      titleHelpContent={t(
        'Storage maps define how the storage of source VMs will be provisioned on the target cluster by linking source storage entities to target storage classes.',
      )}
      userSettings={userSettings}
      customNoResultsFound={<StorageMapsEmptyState namespace={namespace} />}
      page={1}
    />
  );
};

export default StorageMapsListPage;
