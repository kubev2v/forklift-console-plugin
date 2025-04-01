import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components/Suspend';
import { useOpenShiftStorages, useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import { Mapping } from 'src/modules/Providers/views/migrate/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderModelGroupVersionKind,
  StorageMapModel,
  V1beta1Provider,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
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
  StorageMap: null,
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
    (p) =>
      p?.metadata?.uid === obj?.spec?.provider?.source?.uid ||
      p?.metadata?.name === obj?.spec?.provider?.source?.name,
  );
  const [sourceStorages] = useSourceStorages(sourceProvider);

  const destinationProvider = providers.find(
    (p) =>
      p?.metadata?.uid === obj?.spec?.provider?.destination?.uid ||
      p?.metadata?.name === obj?.spec?.provider?.destination?.name,
  );
  const [destinationStorages] = useOpenShiftStorages(destinationProvider);

  const onUpdate = async () => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    await k8sUpdate({ model: StorageMapModel, data: state.StorageMap });
    dispatch({ type: 'SET_UPDATING', payload: false });
  };

  const isStorageMapped = (StorageMapID: string) => {
    return state.StorageMap.spec.map.find((m) => StorageMapID === m?.source?.id) !== undefined;
  };

  const availableSources = sourceStorages?.filter((n) => !isStorageMapped(n?.id));

  const getInventoryStorageName = (id: string) => sourceStorages?.find((s) => s.id === id)?.name;

  const onAdd = () =>
    availableSources.length > 0 &&
    dispatch({
      type: 'SET_MAP',
      payload: [
        ...(state.StorageMap?.spec?.map || []),
        sourceProvider?.spec?.type === 'openshift'
          ? {
              source: { name: availableSources?.[0]?.name },
              destination: { storageClass: destinationStorages?.[0].name },
            }
          : {
              source: { id: availableSources?.[0]?.id },
              destination: { storageClass: destinationStorages?.[0].name },
            },
      ],
    });

  const onReplace = ({ current, next }) => {
    const currentDestinationStorage = destinationStorages.find(
      (n) => n.name == current.destination,
    );
    const currentSourceStorage = sourceStorages?.find((n) => n?.name === current.source);

    const nextDestinationStorage = destinationStorages.find((n) => n.name == next.destination);
    const nextSourceStorage = sourceStorages?.find((n) => n?.name === next.source);

    // sanity check, names may not be valid
    if (!nextSourceStorage || !nextDestinationStorage) {
      return;
    }

    const nextMap: V1beta1StorageMapSpecMap =
      sourceProvider?.spec?.type === 'openshift'
        ? {
            source: { name: nextSourceStorage.name },
            destination: { storageClass: nextDestinationStorage.name },
          }
        : {
            source: { id: nextSourceStorage.id },
            destination: { storageClass: nextDestinationStorage.name },
          };

    const payload = state?.StorageMap?.spec?.map?.map((map) => {
      return map?.source?.id === currentSourceStorage?.id &&
        map.destination?.storageClass === currentDestinationStorage?.name
        ? nextMap
        : map;
    });

    dispatch({
      type: 'SET_MAP',
      payload: payload || [],
    });
  };

  const onDelete = (current: Mapping) => {
    const references = storageNameToIDReference(state?.StorageMap?.status?.references || []);
    const currentSourceStorage = sourceStorages?.find((n) => n.name === current.source);

    dispatch({
      type: 'SET_MAP',
      payload: [
        ...(state?.StorageMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceStorage?.id ||
                map?.source?.name === current.source ||
                map?.source?.id === references[current.source]) &&
              map.destination?.storageClass === current.destination
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
          availableDestinations={[...destinationStorages.map((s) => s?.name)]}
          sources={sourceStorages.map((n) => ({
            label: n.name,
            usedBySelectedVms: false,
            isMapped: isStorageMapped(n?.id),
          }))}
          mappings={state?.StorageMap?.spec?.map.map((m) => ({
            source: getInventoryStorageName(m.source.id) || m.source?.name,
            destination: m.destination.storageClass,
          }))}
          generalSourcesLabel={t('Other storages present on the source provider ')}
          usedSourcesLabel={t('Storages used by the selected VMs')}
          noSourcesLabel={t('No storages in this category')}
          isDisabled={false}
        />
      </DescriptionListDescription>
    </Suspend>
  );
};

type MapsSectionProps = {
  obj: V1beta1StorageMap;
};

function storageNameToIDReference(array: { id?: string; name?: string }[]): Record<string, string> {
  return array.reduce((accumulator, current) => {
    if (current?.id && current?.name) {
      accumulator[current.name] = current.id;
    }
    return accumulator;
  }, {} as Record<string, string>);
}
