import { type FC, useMemo } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import NetworkMapsEmptyState from 'src/networkMaps/components/NetworkMapsEmptyState';

import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  type V1beta1NetworkMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import NetworkMapsAddButton from '../../components/NetworkMapsAddButton';
import { NETWORK_MAP_STATUS } from '../../utils/constants/network-map-status';
import { getNetworkMapPhase } from '../../utils/helpers/getNetworkMapPhase';
import type { NetworkMapData } from '../../utils/types/NetworkMapData';

import NetworkMapRow from './NetworkMapRow';

import './NetworkMapsListPage.style.css';

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
      values: enumToTuple(NETWORK_MAP_STATUS),
    },
    isVisible: true,
    jsonPath: getNetworkMapPhase,
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

const NetworkMapsListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
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
    <StandardPage<NetworkMapData>
      data-testid="network-maps-list"
      {...(permissions.canCreate && {
        addButton: <NetworkMapsAddButton namespace={namespace} testId="add-network-map-button" />,
      })}
      dataSource={[data || [], networkMapsLoaded, networkMapsLoadError]}
      RowMapper={NetworkMapRow}
      fieldsMetadata={fieldsMetadata}
      namespace={namespace}
      title={t('Network maps')}
      titleHelpContent={t(
        'Network maps ensure that the network configurations of your migrating virtual machines (VMs) are correctly translated and applied in the target environment.',
      )}
      userSettings={userSettings}
      customNoResultsFound={<NetworkMapsEmptyState namespace={namespace} />}
      page={1}
    />
  );
};

export default NetworkMapsListPage;
