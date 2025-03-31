import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components';
import {
  type InventoryNetwork,
  useOpenShiftNetworks,
  useSourceNetworks,
} from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { updateNetworkMapDestination } from 'src/modules/Providers/views/migrate/useSaveEffect';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModel,
  type OpenShiftNetworkAttachmentDefinition,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1NetworkMapSpecMapDestination,
  type V1beta1NetworkMapSpecMapSource,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';

import { mapsSectionReducer, type MapsSectionState } from './state/reducer';

const initialState: MapsSectionState = {
  hasChanges: false,
  networkMap: null,
  updating: false,
};

export const MapsSection: React.FC<MapsSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(mapsSectionReducer, initialState);

  // Initialize the state with the prop obj
  React.useEffect(() => {
    dispatch({ payload: obj, type: 'INIT' });
  }, [obj]);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: obj.metadata.namespace,
    namespaced: true,
  });

  const sourceProvider = providers.find(
    (p) =>
      p?.metadata?.uid === obj?.spec?.provider?.source?.uid ||
      p?.metadata?.name === obj?.spec?.provider?.source?.name,
  );
  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const destinationProvider = providers.find(
    (p) =>
      p?.metadata?.uid === obj?.spec?.provider?.destination?.uid ||
      p?.metadata?.name === obj?.spec?.provider?.destination?.name,
  );
  const [destinationNetworks] = useOpenShiftNetworks(destinationProvider);

  const onUpdate = async () => {
    dispatch({ payload: true, type: 'SET_UPDATING' });
    await k8sUpdate({
      data: updateNetworkMapDestination(state.networkMap),
      model: NetworkMapModel,
    });
    dispatch({ payload: false, type: 'SET_UPDATING' });
  };

  const isNetMapped = (networkMapID: string) => {
    return state.networkMap.spec.map.find((m) => networkMapID === m?.source?.id) !== undefined;
  };

  const availableSources = sourceNetworks?.filter((n) => !isNetMapped(n?.id));

  const onAdd = () =>
    availableSources.length > 0 &&
    dispatch({
      payload: [
        ...(state.networkMap?.spec?.map || []),
        {
          destination: { type: 'pod' },
          source: convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(availableSources[0]),
        },
      ],
      type: 'SET_MAP',
    });

  const onReplace = ({ current, next }) => {
    const currentDestinationNet = destinationNetworks.find(
      (n) => OpenShiftNetworkAttachmentDefinitionToName(n) == current.destination,
    );
    const currentSourceNet = sourceNetworks.find((n) => n?.name === current.source) || {
      id: 'pod',
    };

    const nextDestinationNet = destinationNetworks.find(
      (n) => OpenShiftNetworkAttachmentDefinitionToName(n) == next.destination,
    );
    const nextSourceNet = sourceNetworks.find((n) => n?.name === next.source);

    // sanity check, names may not be valid
    if (!nextSourceNet) {
      return;
    }

    const nextMap: V1beta1NetworkMapSpecMap = {
      destination:
        convertOpenShiftNetworkAttachmentDefinitionToV1beta1NetworkMapSpecMapDestination(
          nextDestinationNet,
        ),
      source: convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(nextSourceNet),
    };

    const payload = state?.networkMap?.spec?.map?.map((map) => {
      return (map?.source?.id === currentSourceNet?.id ||
        map.source?.type === currentSourceNet?.id) &&
        (map.destination?.name === currentDestinationNet?.name ||
          map.destination?.type === currentDestinationNet?.type)
        ? nextMap
        : map;
    });

    dispatch({
      payload: payload || [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const currentDestinationNet = destinationNetworks.find(
      (n) => OpenShiftNetworkAttachmentDefinitionToName(n) == current.destination,
    ) || { type: 'pod' };
    const currentSourceNet = sourceNetworks.find((n) => n?.name === current.source) || {
      id: 'pod',
    };

    dispatch({
      payload: [
        ...(state?.networkMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceNet?.id ||
                map.source?.type === currentSourceNet?.id) &&
              (map.destination?.name === currentDestinationNet.name ||
                map.destination?.type === currentDestinationNet.type)
            ),
        ) || []),
      ],
      type: 'SET_MAP',
    });
  };

  const onClick = () => {
    dispatch({ payload: obj, type: 'INIT' });
  };

  return (
    <Suspend obj={providers} loaded={providersLoaded} loadError={providersLoadError}>
      <Flex className="forklift-network-map__details-tab--update-button">
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.hasChanges || state.updating}
            icon={state.updating ? <Spinner size="sm" /> : undefined}
          >
            {t('Update mappings')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button
            variant="secondary"
            onClick={onClick}
            isDisabled={!state.hasChanges || state.updating}
          >
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>

      <DescriptionListDescription className="forklift-page-mapping-list">
        <MappingList
          addMapping={onAdd}
          replaceMapping={onReplace}
          deleteMapping={onDelete}
          availableDestinations={[
            ...destinationNetworks.map((net) => `${net?.namespace}/${net?.name}`),
            'Pod',
          ]}
          sources={sourceNetworks.map((n) => ({
            isMapped: isNetMapped(n?.id),
            label: n.name,
            usedBySelectedVms: false,
          }))}
          mappings={state?.networkMap?.spec?.map.map((m) => ({
            destination: getDestinationNetName(destinationNetworks, m.destination),
            source:
              m.source?.type === 'pod' ? 'Pod network' : getSourceNetName(sourceNetworks, m.source),
          }))}
          generalSourcesLabel={t('Other networks present on the source provider ')}
          usedSourcesLabel={t('Networks used by the selected VMs')}
          noSourcesLabel={t('No networks in this category')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </Suspend>
  );
};

export type MapsSectionProps = {
  obj: V1beta1NetworkMap;
};

const getSourceNetName = (networks: InventoryNetwork[], source: V1beta1NetworkMapSpecMapSource) => {
  const net = networks.find((n) => n?.id === source?.id || n?.name === source?.name);

  return net?.name || source?.name || source?.id;
};

const getDestinationNetName = (
  networks: OpenShiftNetworkAttachmentDefinition[],
  destination: V1beta1NetworkMapSpecMapDestination,
) => {
  const net = networks.find(
    (n) => n?.name === destination?.name && n?.namespace === destination?.namespace,
  );

  return net ? OpenShiftNetworkAttachmentDefinitionToName(net) : 'Pod';
};

function convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(
  inventoryNetwork: InventoryNetwork,
): V1beta1NetworkMapSpecMapSource {
  if (!inventoryNetwork) {
    return undefined;
  }

  if (inventoryNetwork?.id === 'pod') {
    return { type: 'pod' };
  }

  return {
    id: inventoryNetwork?.id,
    name: inventoryNetwork.name,
    namespace: inventoryNetwork.namespace,
  };
}

function convertOpenShiftNetworkAttachmentDefinitionToV1beta1NetworkMapSpecMapDestination(
  networkAttachmentDefinition: OpenShiftNetworkAttachmentDefinition,
): V1beta1NetworkMapSpecMapDestination {
  if (!networkAttachmentDefinition) {
    return { type: 'pod' };
  }

  return {
    name: networkAttachmentDefinition.name,
    namespace: networkAttachmentDefinition.namespace,
    type: networkAttachmentDefinition.type || 'multus',
  };
}

const OpenShiftNetworkAttachmentDefinitionToName = (net) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : net?.name || 'Pod';
