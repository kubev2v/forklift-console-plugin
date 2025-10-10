import { type FC, useEffect, useReducer } from 'react';
import { updateNetworkMapDestination } from 'src/modules/NetworkMaps/utils/helpers/updateNetworkMapDestination';
import MapsButtonArea from 'src/modules/NetworkMaps/views/details/components/MapsSection/MapsButtonArea.tsx';
import {
  convertInventoryNetworkToSource,
  convertNetworkToDestination,
  getDestinationNetName,
  getSourceNetName,
  isNetMapped,
  openShiftNetworkAttachmentDefinitionToName,
} from 'src/modules/NetworkMaps/views/details/components/MapsSection/mapsSectionUtils.ts';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { MULTUS, POD } from 'src/plans/details/utils/constants.ts';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  NetworkMapModel,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionListDescription } from '@patternfly/react-core';
import { DEFAULT_NETWORK } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { mapsSectionReducer, type MapsSectionState } from './state/reducer';

type MapsSectionProps = {
  obj: V1beta1NetworkMap;
};

const initialState: MapsSectionState = {
  hasChanges: false,
  networkMap: null,
  updating: false,
};

export const MapsSection: FC<MapsSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(mapsSectionReducer, initialState);

  // Initialize the state with the prop obj
  useEffect(() => {
    dispatch({ payload: obj, type: 'INIT' });
  }, [obj]);

  const [sourceProvider, sourceProviderLoaded, sourceProviderLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: obj?.spec?.provider?.source?.name,
      namespace: obj?.spec?.provider?.source?.namespace,
      namespaced: true,
    });

  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const [destinationProvider, destinationProviderLoaded, destinationProviderLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: obj?.spec?.provider?.destination?.name,
      namespace: obj?.spec?.provider?.destination?.namespace,
      namespaced: true,
    });

  const [destinationNetworks] = useOpenShiftNetworks(destinationProvider);

  const onUpdate = async () => {
    if (state.networkMap) {
      dispatch({ payload: true, type: 'SET_UPDATING' });
      await k8sUpdate({
        data: updateNetworkMapDestination(state.networkMap),
        model: NetworkMapModel,
      });
      dispatch({ payload: false, type: 'SET_UPDATING' });
    }
  };

  const availableSources = sourceNetworks?.filter(
    (network) => !isNetMapped(network?.id, state.networkMap),
  );

  const onAdd = () => {
    if (!isEmpty(availableSources)) {
      dispatch({
        payload: [
          ...(state.networkMap?.spec?.map ?? []),
          {
            destination: { type: POD },
            source: convertInventoryNetworkToSource(availableSources[0]),
          },
        ],
        type: 'SET_MAP',
      });
    }
  };

  const onReplace = ({ current, next }: { current: Mapping; next: Mapping }) => {
    const currentDestinationNet = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
    ) ?? { name: DEFAULT_NETWORK, type: POD };
    const currentSourceNet = sourceNetworks.find((network) => network?.name === current.source) ?? {
      id: POD,
    };

    const nextDestinationNet = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === next.destination,
    );
    const nextSourceNet = sourceNetworks.find((network) => network?.name === next.source);

    // sanity check, names may not be valid
    if (!nextSourceNet) {
      return;
    }

    const nextMap: V1beta1NetworkMapSpecMap = {
      destination: convertNetworkToDestination(nextDestinationNet),
      source: convertInventoryNetworkToSource(nextSourceNet),
    };

    const payload = state?.networkMap?.spec?.map?.map((map) => {
      return (map?.source?.id === currentSourceNet?.id ||
        map.source?.type === currentSourceNet?.id) &&
        (map.destination?.name === currentDestinationNet?.name || map.destination?.type === MULTUS)
        ? nextMap
        : map;
    });

    dispatch({
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const currentDestinationNet = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
    ) ?? { name: DEFAULT_NETWORK, type: POD };
    const currentSourceNet = sourceNetworks.find((network) => network?.name === current.source) ?? {
      id: POD,
    };

    dispatch({
      payload: [
        ...(state?.networkMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceNet?.id ||
                map.source?.type === currentSourceNet?.id) &&
              (map.destination?.name === currentDestinationNet?.name ||
                map.destination?.type === MULTUS)
            ),
        ) ?? []),
      ],
      type: 'SET_MAP',
    });
  };

  const onCancel = () => {
    dispatch({ payload: obj, type: 'INIT' });
  };

  return (
    <LoadingSuspend
      obj={[sourceProvider, destinationProvider]}
      loaded={sourceProviderLoaded && destinationProviderLoaded}
      loadError={sourceProviderLoadError ?? destinationProviderLoadError}
    >
      <MapsButtonArea
        hasChanges={state.hasChanges}
        updating={state.updating}
        onUpdate={onUpdate}
        onCancel={onCancel}
      />
      <DescriptionListDescription className="forklift-page-mapping-list pf-v6-u-mt-md">
        <MappingList
          addMapping={onAdd}
          replaceMapping={onReplace}
          deleteMapping={onDelete}
          availableDestinations={[
            ...destinationNetworks.map((net) => `${net?.namespace}/${net?.name}`),
            DEFAULT_NETWORK,
          ]}
          sources={sourceNetworks.map((network) => ({
            isMapped: isNetMapped(network?.id, state.networkMap),
            label: network.name,
            usedBySelectedVms: false,
          }))}
          mappings={
            state?.networkMap?.spec?.map.map((networkMapSpec) => ({
              destination: getDestinationNetName(destinationNetworks, networkMapSpec.destination),
              source:
                networkMapSpec.source?.type === POD
                  ? DEFAULT_NETWORK
                  : (getSourceNetName(sourceNetworks, networkMapSpec.source) ?? ''),
            })) ?? []
          }
          generalSourcesLabel={t('Other networks present on the source provider ')}
          usedSourcesLabel={t('Networks used by the selected VMs')}
          noSourcesLabel={t('No networks in this category')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </LoadingSuspend>
  );
};
