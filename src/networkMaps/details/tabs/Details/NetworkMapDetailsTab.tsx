import { type FC, useMemo } from 'react';
import { ConditionsSection } from 'src/components/ConditionsSection/ConditionsSection';
import SectionHeading from 'src/components/headers/SectionHeading';
import { getMappingValues } from 'src/networkMaps/create/utils/buildNetworkMappings';
import NetworkMapReviewTable from 'src/plans/create/steps/review/NetworkMapReviewTable';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/utils/hooks/useNetworks';
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
} from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from '@utils/crds/maps/selectors';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

import DetailsSection from '../../components/DetailsSection/DetailsSection';
import NetworkMapEdit from '../../components/MapsSection/NetworkMapEdit';
import type { NetworkMapEditProps } from '../../components/MapsSection/utils/types';

type NetworkMapDetailsTabProps = {
  name: string;
  namespace: string;
};

const NetworkMapDetailsTab: FC<NetworkMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const [networkMap, loaded, loadError] = useTypedK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  const [sourceProvider] = useTypedK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapSourceProviderName(networkMap),
    namespace: getMapSourceProviderNamespace(networkMap),
    namespaced: true,
  });

  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const [destinationProvider] = useTypedK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapDestinationProviderName(networkMap),
    namespace: getMapDestinationProviderNamespace(networkMap),
    namespaced: true,
  });
  const [destinationNetworks] = useOpenShiftNetworks(destinationProvider);

  const currentMappings = useMemo(
    () =>
      getMappingValues(
        networkMap?.spec?.map,
        sourceProvider,
        sourceNetworks,
        destinationNetworks,
      ) ?? [],
    [networkMap?.spec?.map, sourceProvider, sourceNetworks, destinationNetworks],
  );

  return (
    <LoadingSuspend loaded={loaded} loadError={loadError} obj={networkMap}>
      <PageSection className="forklift-page-section--details" hasBodyWrapper={false}>
        <SectionHeading text={t('Network map details')} />
        <DetailsSection obj={networkMap} />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeadingWithEdit
          onClick={() => {
            launchOverlay<MapProvidersEditProps>(MapProvidersEdit, {
              destinationProvider,
              model: NetworkMapModel,
              namespace,
              obj: networkMap,
              sourceProvider,
            });
          }}
          title={t('Providers')}
        />
        <MapProvidersDetails obj={networkMap} />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeadingWithEdit
          data-testid="network-map-edit-button"
          onClick={() => {
            launchOverlay<NetworkMapEditProps>(NetworkMapEdit, {
              destinationProvider,
              initialMappings: currentMappings,
              networkMap,
              sourceProvider,
            });
          }}
          title={t('Map')}
        />
        <NetworkMapReviewTable networkMap={currentMappings} />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={networkMap?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};

export default NetworkMapDetailsTab;
