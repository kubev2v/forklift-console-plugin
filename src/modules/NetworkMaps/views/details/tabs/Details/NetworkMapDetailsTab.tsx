import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { buildFormNetworkMapping } from 'src/networkMaps/create/utils/buildNetworkMappings';
import NetworkMapReviewTable from 'src/plans/create/steps/review/NetworkMapReviewTable';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import LoadingSuspend from '@components/LoadingSuspend';
import MapProvidersDetails from '@components/MapProvidersDetails/MapProvidersDetails';
import MapProvidersEdit from '@components/MapProvidersDetails/MapProvidersEdit';
import type { MapProvidersEditProps } from '@components/MapProvidersDetails/utils/types';
import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource, useModal } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
} from '@utils/crds/maps/selectors';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import DetailsSection from '../../components/DetailsSection/DetailsSection';
import NetworkMapEdit from '../../components/MapsSection/NetworkMapEdit';
import type { NetworkMapEditProps } from '../../components/MapsSection/utils/types';

type NetworkMapDetailsTabProps = {
  name: string;
  namespace: string;
};

const NetworkMapDetailsTab: FC<NetworkMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const [networkMap, loaded, loadError] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  const [sourceProvider] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapSourceProviderName(networkMap),
    namespace,
    namespaced: true,
  });

  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const [destinationProvider] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapDestinationProviderName(networkMap),
    namespace: getMapDestinationProviderNamespace(networkMap),
    namespaced: true,
  });
  const [destinationNetworks] = useOpenShiftNetworks(destinationProvider);

  const currentMappings =
    buildFormNetworkMapping(
      networkMap?.spec?.map,
      sourceProvider,
      sourceNetworks,
      destinationNetworks,
    ) ?? [];

  return (
    <LoadingSuspend obj={networkMap} loaded={loaded} loadError={loadError}>
      <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
        <SectionHeading text={t('Network map details')} />
        <DetailsSection obj={networkMap} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeadingWithEdit
          title={t('Providers')}
          onClick={() => {
            launcher<MapProvidersEditProps>(MapProvidersEdit, {
              destinationProvider,
              model: NetworkMapModel,
              namespace,
              obj: networkMap,
              sourceProvider,
            });
          }}
        />
        <MapProvidersDetails obj={networkMap} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeadingWithEdit
          title={t('Map')}
          onClick={() => {
            launcher<NetworkMapEditProps>(NetworkMapEdit, {
              destinationProvider,
              initialMappings: currentMappings,
              namespace,
              networkMap,
              sourceProvider,
            });
          }}
          data-testid="network-map-edit-button"
        />
        <NetworkMapReviewTable networkMap={currentMappings} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={networkMap?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};

export default NetworkMapDetailsTab;
