import { type FC, useEffect, useReducer } from 'react';
import { updateNetworkMapDestination } from 'src/modules/NetworkMaps/utils/helpers/updateNetworkMapDestination';
import {
  type InventoryNetwork,
  useOpenShiftNetworks,
  useSourceNetworks,
} from 'src/modules/Providers/hooks/useNetworks';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
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
  ButtonVariant,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { POD_NETWORK } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { mapsSectionReducer, type MapsSectionState } from './state/reducer';

type MapsSectionProps = {
  obj: V1beta1NetworkMap;
};

const convertInventoryNetworkToV1beta1NetworkMapSpecMapSource = (
  inventoryNetwork: InventoryNetwork,
): V1beta1NetworkMapSpecMapSource | undefined => {
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
};

const openShiftNetworkAttachmentDefinitionToName = (net: OpenShiftNetworkAttachmentDefinition) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? 'Pod');

const getSourceNetName = (networks: InventoryNetwork[], source: V1beta1NetworkMapSpecMapSource) => {
  const net = networks.find(
    (network) => network?.id === source?.id || network?.name === source?.name,
  );

  return net?.name ?? source?.name ?? source?.id;
};

const getDestinationNetName = (
  networks: OpenShiftNetworkAttachmentDefinition[],
  destination: V1beta1NetworkMapSpecMapDestination,
) => {
  const net = networks.find(
    (network) =>
      network?.name === destination?.name && network?.namespace === destination?.namespace,
  );

  return net ? openShiftNetworkAttachmentDefinitionToName(net) : 'Pod';
};

const convertOpenShiftNetworkAttachmentDefinitionToV1beta1NetworkMapSpecMapDestination = (
  networkAttachmentDefinition: OpenShiftNetworkAttachmentDefinition,
): V1beta1NetworkMapSpecMapDestination => {
  if (!networkAttachmentDefinition) {
    return { type: 'pod' };
  }

  return {
    name: networkAttachmentDefinition.name,
    namespace: networkAttachmentDefinition.namespace,
    type: networkAttachmentDefinition.type ?? 'multus',
  };
};

const isNetMapped = (networkMapID: string, networkMap: V1beta1NetworkMap | null) => {
  return (
    networkMap?.spec?.map.find((networkMapSpec) => networkMapID === networkMapSpec?.source?.id) !==
    undefined
  );
};

type MapsButtonAreaProps = {
  hasChanges: boolean;
  updating: boolean;
  onUpdate: () => void;
  onCancel: () => void;
};

const MapsButtonArea: FC<MapsButtonAreaProps> = ({ hasChanges, onCancel, onUpdate, updating }) => {
  const { t } = useForkliftTranslation();

  return (
    <Flex className="forklift-network-map__details-tab--update-button">
      <FlexItem>
        <Button
          variant={ButtonVariant.primary}
          onClick={onUpdate}
          isDisabled={!hasChanges || updating}
          icon={updating ? <Spinner size="sm" /> : undefined}
        >
          {t('Update mappings')}
        </Button>
      </FlexItem>
      <FlexItem>
        <Button
          variant={ButtonVariant.secondary}
          onClick={onCancel}
          isDisabled={!hasChanges || updating}
        >
          {t('Cancel')}
        </Button>
      </FlexItem>
    </Flex>
  );
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

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: obj.metadata?.namespace,
    namespaced: true,
  });

  const sourceProvider = providers.find(
    (provider) =>
      provider?.metadata?.uid === obj?.spec?.provider?.source?.uid ||
      provider?.metadata?.name === obj?.spec?.provider?.source?.name,
  );
  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const destinationProvider = providers.find(
    (provider) =>
      provider?.metadata?.uid === obj?.spec?.provider?.destination?.uid ||
      provider?.metadata?.name === obj?.spec?.provider?.destination?.name,
  );
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
            destination: { type: 'pod' },
            source: convertInventoryNetworkToV1beta1NetworkMapSpecMapSource(availableSources[0]),
          },
        ],
        type: 'SET_MAP',
      });
    }
  };

  const onReplace = ({ current, next }: { current: Mapping; next: Mapping }) => {
    const currentDestinationNet = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
    );
    const currentSourceNet = sourceNetworks.find((network) => network?.name === current.source) ?? {
      id: 'pod',
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
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const currentDestinationNet = destinationNetworks.find(
      (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
    ) ?? { type: 'pod' };
    const currentSourceNet = sourceNetworks.find((network) => network?.name === current.source) ?? {
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
        ) ?? []),
      ],
      type: 'SET_MAP',
    });
  };

  const onCancel = () => {
    dispatch({ payload: obj, type: 'INIT' });
  };

  return (
    <LoadingSuspend obj={providers} loaded={providersLoaded} loadError={providersLoadError}>
      <MapsButtonArea
        hasChanges={state.hasChanges}
        updating={state.updating}
        onUpdate={onUpdate}
        onCancel={onCancel}
      />
      <DescriptionListDescription className="forklift-page-mapping-list">
        <MappingList
          addMapping={onAdd}
          replaceMapping={onReplace}
          deleteMapping={onDelete}
          availableDestinations={[
            ...destinationNetworks.map((net) => `${net?.namespace}/${net?.name}`),
            'Pod',
          ]}
          sources={sourceNetworks.map((network) => ({
            isMapped: isNetMapped(network?.id, state.networkMap),
            label: network.name,
            usedBySelectedVms: false,
          }))}
          mappings={state?.networkMap?.spec?.map.map((networkMapSpec) => ({
            destination: getDestinationNetName(destinationNetworks, networkMapSpec.destination),
            source:
              networkMapSpec.source?.type === 'pod'
                ? POD_NETWORK
                : getSourceNetName(sourceNetworks, networkMapSpec.source),
          }))}
          generalSourcesLabel={t('Other networks present on the source provider ')}
          usedSourcesLabel={t('Networks used by the selected VMs')}
          noSourcesLabel={t('No networks in this category')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </LoadingSuspend>
  );
};
