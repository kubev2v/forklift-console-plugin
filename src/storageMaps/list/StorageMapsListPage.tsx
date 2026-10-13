import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import StorageMapsEmptyState from 'src/storageMaps/components/StorageMapsEmptyState';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import {
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { getMapTableFields } from '@utils/crds/maps/mapTableFields';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import type { StorageMapData } from '@utils/storage/types';

import StorageMapsAddButton from '../components/StorageMapsAddButton';

import StorageMapRow from './StorageMapRow';

import './StorageMapsListPage.style.css';

const StorageMapsListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const fieldsMetadata = useMemo(() => getMapTableFields(t), [t]);
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
    <LearningExperienceDrawer>
      <StandardPage<StorageMapData>
        data-testid="network-maps-list"
        resizableColumns
        {...(permissions.canCreate && {
          addButton: <StorageMapsAddButton namespace={namespace} testId="add-storage-map-button" />,
        })}
        customNoResultsFound={<StorageMapsEmptyState namespace={namespace} />}
        dataSource={[data || [], StorageMapsLoaded, StorageMapsLoadError]}
        fieldsMetadata={fieldsMetadata}
        namespace={namespace}
        row={StorageMapRow}
        shouldShowLearningExperienceButton
        title={t('Storage maps')}
        titleHelpContent={t(
          'Storage maps define how the storage of source VMs will be provisioned on the target cluster by linking source storage entities to target storage classes.',
        )}
        userSettings={userSettings}
      />
    </LearningExperienceDrawer>
  );
};

export default StorageMapsListPage;
