import { type FC, useEffect, useMemo, useReducer } from 'react';
import { updateNetworkMapDestination } from 'src/modules/NetworkMaps/utils/helpers/updateNetworkMapDestination';
import MapsButtonArea from 'src/modules/NetworkMaps/views/details/components/MapsSection/MapsButtonArea';
import {
  convertInventoryNetworkToSource,
  getCurrentDestinationNet,
  getCurrentSourceNet,
  getMappings,
  getReplacePayload,
  isNetMapped,
} from 'src/modules/NetworkMaps/views/details/components/MapsSection/mapsSectionUtils';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { POD } from 'src/plans/details/utils/constants';
import { isMapDestinationTypeSupported } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  NetworkMapModel,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionListDescription } from '@patternfly/react-core';
import { DEFAULT_NETWORK } from '@utils/constants';
import { getDuplicateValues, isEmpty } from '@utils/helpers';

import { mapsSectionReducer, type MapsSectionState } from './state/reducer';

const initialState: MapsSectionState = {
  hasChanges: false,
  networkMap: null,
  updating: false,
};

type MapsSectionProps = {
  obj: V1beta1NetworkMap;
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

  const duplicateNetworkNames = useMemo(
    () => getDuplicateValues(sourceNetworks, (network) => network.name),
    [sourceNetworks],
  );

  const sources = useMemo(
    () =>
      sourceNetworks.map((network) => ({
        isMapped: isNetMapped(network?.id, state.networkMap),
        label: duplicateNetworkNames.has(network.name)
          ? `${network.name} (${network.id})`
          : network.name,
        usedBySelectedVms: false,
      })),
    [duplicateNetworkNames, sourceNetworks, state.networkMap],
  );

  const availableDestinations = useMemo(
    () => [...destinationNetworks.map((net) => `${net?.namespace}/${net?.name}`), DEFAULT_NETWORK],
    [destinationNetworks],
  );

  const mappings = useMemo(
    () => getMappings(state, sourceNetworks, destinationNetworks, duplicateNetworkNames),
    [destinationNetworks, duplicateNetworkNames, sourceNetworks, state],
  );

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
    const payload = getReplacePayload(state, current, next, sourceNetworks, destinationNetworks);
    dispatch({
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const currentDestinationNet = getCurrentDestinationNet(current, destinationNetworks);
    const currentSourceNet = getCurrentSourceNet(current, sourceNetworks);

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
          availableDestinations={availableDestinations}
          sources={sources}
          mappings={mappings}
          generalSourcesLabel={t('Networks')}
          usedSourcesLabel={t('Used networks')}
          noSourcesLabel={t('No networks available')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </LoadingSuspend>
  );
};
