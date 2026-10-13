import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import NetworkMapsEmptyState from 'src/networkMaps/components/NetworkMapsEmptyState';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  type V1beta1NetworkMap,
} from '@forklift-ui/types';
import { getMapTableFields } from '@utils/crds/maps/mapTableFields';
import type { NetworkMapData } from '@utils/crds/maps/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import NetworkMapsAddButton from '../components/NetworkMapsAddButton';

import NetworkMapRow from './NetworkMapRow';

import './NetworkMapsListPage.style.css';

const NetworkMapsListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const fieldsMetadata = useMemo(() => getMapTableFields(t), [t]);
  const userSettings = useMemo(() => loadUserSettings({ pageId: 'NetworkMaps' }), []);

  const [networkMaps, networkMapsLoaded, networkMapsLoadError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: NetworkMapModel,
    namespace,
  });

  const data: NetworkMapData[] = networkMaps.map((obj) => ({
    obj,
    permissions,
  }));

  return (
    <LearningExperienceDrawer>
      <StandardPage<NetworkMapData>
        data-testid="network-maps-list"
        resizableColumns
        {...(permissions.canCreate && {
          addButton: <NetworkMapsAddButton namespace={namespace} testId="add-network-map-button" />,
        })}
        customNoResultsFound={<NetworkMapsEmptyState namespace={namespace} />}
        dataSource={[data || [], networkMapsLoaded, networkMapsLoadError]}
        fieldsMetadata={fieldsMetadata}
        namespace={namespace}
        row={NetworkMapRow}
        shouldShowLearningExperienceButton
        title={t('Network maps')}
        titleHelpContent={t(
          'Network maps ensure that the network configurations of your migrating virtual machines (VMs) are correctly translated and applied in the target environment.',
        )}
        userSettings={userSettings}
      />
    </LearningExperienceDrawer>
  );
};

export default NetworkMapsListPage;
