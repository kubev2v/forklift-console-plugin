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
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  NetworkMapModel,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1NetworkMapSpecMapDestination,
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

// eslint-disable-next-line max-lines-per-function
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

  const onReplace = (index: number, updatedMapping: Mapping) => {
    const nextDestinationNet =
      updatedMapping.destination === DEFAULT_NETWORK ||
      updatedMapping.destination === IgnoreNetwork.Label
        ? undefined
        : destinationNetworks.find(
            (network) =>
              openShiftNetworkAttachmentDefinitionToName(network) === updatedMapping.destination,
          );

    // Strip " (id)" suffix from source names with duplicates
    const nextSourceName = updatedMapping.source.replace(/ \([^)]+\)$/u, '');

    const nextSourceNet =
      nextSourceName === DEFAULT_NETWORK
        ? { id: POD }
        : sourceNetworks.find((network) => network?.name === nextSourceName);

    if (!state?.networkMap?.spec?.map || !nextSourceNet) {
      return;
    }

    const getDestination = (): V1beta1NetworkMapSpecMapDestination => {
      if (updatedMapping.destination === IgnoreNetwork.Label) {
        return { type: IGNORED };
      }

      if (updatedMapping.destination === DEFAULT_NETWORK) {
        return { type: POD };
      }

      return convertNetworkToDestination(nextDestinationNet);
    };

    const nextMap: V1beta1NetworkMapSpecMap = {
      destination: getDestination(),
      source: convertInventoryNetworkToSource(nextSourceNet),
    };

    const payload = [...state.networkMap.spec.map];
    payload[index] = nextMap;

    dispatch({
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (deleteIndex: number) => {
    if (!state?.networkMap?.spec?.map.length) {
      return;
    }

    const updatedMaps = [...state.networkMap.spec.map];
    updatedMaps.splice(deleteIndex, 1);

    dispatch({
      payload: updatedMaps,
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
      <DescriptionListDescription className="forklift-page-mapping-list pf-v5-u-mt-md">
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
