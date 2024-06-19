import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components';
import {
  InventoryNetwork,
  useOpenShiftNetworks,
  useSourceNetworks,
} from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import { Mapping } from 'src/modules/Providers/views/migrate/types';
import { updateNetworkMapDestination } from 'src/modules/Providers/views/migrate/useSaveEffect';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModel,
  OpenShiftNetworkAttachmentDefinition,
  ProviderModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
  V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';

import { mapsSectionReducer, MapsSectionState } from './state/reducer';

const initialState: MapsSectionState = {
  networkMap: null,
  hasChanges: false,
  updating: false,
};

export const MapsSection: React.FC<MapsSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(mapsSectionReducer, initialState);

  // Initialize the state with the prop obj
  React.useEffect(() => {
    dispatch({ type: 'INIT', payload: obj });
  }, [obj]);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: obj.metadata.namespace,
  });

  const sourceProvider = providers.find(
    (p) => p?.metadata?.uid === obj?.spec?.provider?.source?.uid,
  );
  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const destinationProvider = providers.find(
    (p) => p?.metadata?.uid === obj?.spec?.provider?.destination?.uid,
  );
  const [destinationNetworks] = useOpenShiftNetworks(destinationProvider);

  const onUpdate = async () => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    await k8sUpdate({
      model: NetworkMapModel,
      data: updateNetworkMapDestination(state.networkMap),
    });
    dispatch({ type: 'SET_UPDATING', payload: false });
  };

  const isNetMapped = (networkMapID: string) => {
    return state.networkMap.spec.map.find((m) => networkMapID === m?.source?.id) !== undefined;
  };

  const availableSources = sourceNetworks?.filter((n) => !isNetMapped(n?.id));

  const onAdd = () =>
    availableSources.length > 0 &&
    dispatch({
      type: 'SET_MAP',
      payload: [
        ...(state.networkMap?.spec?.map || []),
        {
          source: convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(availableSources[0]),
          destination: { type: 'pod' },
        },
      ],
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
      source: convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(nextSourceNet),
      destination:
        convertOpenShiftNetworkAttachmentDefinitionToV1beta1NetworkMapSpecMapDestination(
          nextDestinationNet,
        ),
    };

    const payload = state?.networkMap?.spec?.map?.map((map) => {
      return (map?.source?.id === currentSourceNet?.id ||
        map.source?.type === currentSourceNet?.id) &&
        (map.destination?.name === currentDestinationNet?.['name'] ||
          map.destination?.type === currentDestinationNet?.['type'])
        ? nextMap
        : map;
    });

    dispatch({
      type: 'SET_MAP',
      payload: payload || [],
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
      type: 'SET_MAP',
      payload: [
        ...(state?.networkMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceNet?.id ||
                map.source?.type === currentSourceNet?.id) &&
              (map.destination?.name === currentDestinationNet['name'] ||
                map.destination?.type === currentDestinationNet['type'])
            ),
        ) || []),
      ],
    });
  };

  const onClick = () => {
    dispatch({ type: 'INIT', payload: obj });
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
            label: n.name,
            usedBySelectedVms: false,
            isMapped: isNetMapped(n?.id),
          }))}
          mappings={state?.networkMap?.spec?.map.map((m) => ({
            source:
              m.source?.type === 'pod' ? 'Pod network' : getSourceNetName(sourceNetworks, m.source),
            destination: getDestinationNetName(destinationNetworks, m.destination),
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
    name: inventoryNetwork['name'],
    namespace: inventoryNetwork['namespace'],
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
    type: networkAttachmentDefinition['type'] || 'multus',
  };
}

const OpenShiftNetworkAttachmentDefinitionToName = (net) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : net?.name || 'Pod';
