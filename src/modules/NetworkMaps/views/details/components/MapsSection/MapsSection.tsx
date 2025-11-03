import { type FC, useEffect, useReducer } from 'react';
import { updateNetworkMapDestination } from 'src/modules/NetworkMaps/utils/helpers/updateNetworkMapDestination';
import MapsButtonArea from 'src/modules/NetworkMaps/views/details/components/MapsSection/MapsButtonArea';
import {
  convertInventoryNetworkToSource,
  convertNetworkToDestination,
  getDestinationNetName,
  getSourceNetName,
  isNetMapped,
  openShiftNetworkAttachmentDefinitionToName,
} from 'src/modules/NetworkMaps/views/details/components/MapsSection/mapsSectionUtils';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';
import { IGNORED, POD } from 'src/plans/details/utils/constants';
import { isMapDestinationTypeSupported } from 'src/plans/details/utils/utils';
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
import { getDuplicateValues, isEmpty } from '@utils/helpers';

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
  const availableSources = sourceNetworks?.filter(
    (network) => !isNetMapped(network?.id, state.networkMap),
  );

  const duplicateNetworkNames = getDuplicateValues(sourceNetworks, (network) => network.name);

  const getCurrentDestinationNet = (current: Mapping) => {
    const net = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
    );

    if (net) {
      return net;
    }

    if (current.destination === IgnoreNetwork.Label) {
      return { type: IGNORED };
    }

    return { name: DEFAULT_NETWORK, type: POD };
  };

  const getCurrentSourceNet = (current: Mapping) => {
    const sourceName = current.source.replace(/ \([^)]+\)$/u, '');

    if (sourceName === DEFAULT_NETWORK) {
      return { id: POD };
    }

    return sourceNetworks.find((network) => network?.name === sourceName) ?? { id: POD };
  };

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
    const currentDestinationNet = getCurrentDestinationNet(current);
    const currentSourceNet = getCurrentSourceNet(current);

    const nextDestinationNet =
      next.destination === DEFAULT_NETWORK || next.destination === IgnoreNetwork.Label
        ? undefined
        : destinationNetworks.find(
            (network) => openShiftNetworkAttachmentDefinitionToName(network) === next.destination,
          );

    // Strip " (id)" suffix from source names with duplicates
    const nextSourceName = next.source.replace(/ \([^)]+\)$/u, '');

    const nextSourceNet =
      nextSourceName === DEFAULT_NETWORK
        ? { id: POD }
        : sourceNetworks.find((network) => network?.name === nextSourceName);

    if (!nextSourceNet) {
      return;
    }

    const getDestination = (): V1beta1NetworkMapSpecMapDestination => {
      if (next.destination === IgnoreNetwork.Label) {
        return { type: IGNORED };
      }

      if (next.destination === DEFAULT_NETWORK) {
        return { type: POD };
      }

      return convertNetworkToDestination(nextDestinationNet);
    };

    const nextMap: V1beta1NetworkMapSpecMap = {
      destination: getDestination(),
      source: convertInventoryNetworkToSource(nextSourceNet),
    };

    const payload = state?.networkMap?.spec?.map?.map((map) => {
      const sourceMatches =
        map?.source?.id === currentSourceNet?.id || map.source?.type === currentSourceNet?.id;

      const destinationMatches =
        map.destination?.name === currentDestinationNet?.name ||
        (map.destination?.type === currentDestinationNet?.type &&
          isMapDestinationTypeSupported(map.destination?.type));

      return sourceMatches && destinationMatches ? nextMap : map;
    });

    dispatch({
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const currentDestinationNet = getCurrentDestinationNet(current);
    const currentSourceNet = getCurrentSourceNet(current);

    dispatch({
      payload: [
        ...(state?.networkMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceNet?.id ||
                map?.source?.type === currentSourceNet?.id) &&
              (map?.destination?.name === currentDestinationNet?.name ||
                isMapDestinationTypeSupported(map?.destination?.type))
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
            label: duplicateNetworkNames.has(network.name)
              ? `${network.name} (${network.id})`
              : network.name,
            usedBySelectedVms: false,
          }))}
          mappings={
            state?.networkMap?.spec?.map.map((networkMapSpec) => {
              const sourceName =
                networkMapSpec.source?.type === POD
                  ? DEFAULT_NETWORK
                  : (getSourceNetName(sourceNetworks, networkMapSpec.source) ?? '');

              // Add ID to source name if it's a duplicate, to match the sources labels
              const sourceWithId =
                sourceName !== DEFAULT_NETWORK && duplicateNetworkNames.has(sourceName)
                  ? `${sourceName} (${networkMapSpec.source?.id ?? ''})`
                  : sourceName;

              return {
                destination: getDestinationNetName(destinationNetworks, networkMapSpec.destination),
                source: sourceWithId,
              };
            }) ?? []
          }
          generalSourcesLabel={t('Networks')}
          usedSourcesLabel={t('Used networks')}
          noSourcesLabel={t('No networks available')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </LoadingSuspend>
  );
};
