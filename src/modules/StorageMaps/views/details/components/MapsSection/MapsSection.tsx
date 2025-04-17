import { type FC, useEffect, useReducer } from 'react';
import { useOpenShiftStorages, useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { MappingList } from 'src/modules/Providers/views/migrate/components/MappingList';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import {
  ProviderModelGroupVersionKind,
  StorageMapModel,
  type V1beta1Provider,
  type V1beta1StorageMap,
  type V1beta1StorageMapSpecMap,
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
  StorageMap: null,
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
    namespace: obj.metadata.namespace,
    namespaced: true,
  });

  const sourceProvider = providers.find(
    (provider) =>
      provider?.metadata?.uid === obj?.spec?.provider?.source?.uid ||
      provider?.metadata?.name === obj?.spec?.provider?.source?.name,
  );
  const [sourceStorages] = useSourceStorages(sourceProvider);

  const destinationProvider = providers.find(
    (provider) =>
      provider?.metadata?.uid === obj?.spec?.provider?.destination?.uid ||
      provider?.metadata?.name === obj?.spec?.provider?.destination?.name,
  );
  const [destinationStorages] = useOpenShiftStorages(destinationProvider);

  const onUpdate = async () => {
    dispatch({ payload: true, type: 'SET_UPDATING' });
    await k8sUpdate({ data: state.StorageMap, model: StorageMapModel });
    dispatch({ payload: false, type: 'SET_UPDATING' });
  };

  const isStorageMapped = (StorageMapID: string) => {
    return state.StorageMap.spec.map.find((map) => StorageMapID === map?.source?.id) !== undefined;
  };

  const availableSources = sourceStorages?.filter(
    (sourceStorage) => !isStorageMapped(sourceStorage?.id),
  );

  const getInventoryStorageName = (id: string) =>
    sourceStorages?.find((sourceStorage) => sourceStorage.id === id)?.name;

  const onAdd = () =>
    availableSources.length > 0 &&
    dispatch({
      payload: [
        ...(state.StorageMap?.spec?.map ?? []),
        sourceProvider?.spec?.type === 'openshift'
          ? {
              destination: { storageClass: destinationStorages?.[0].name },
              source: { name: availableSources?.[0]?.name },
            }
          : {
              destination: { storageClass: destinationStorages?.[0].name },
              source: { id: availableSources?.[0]?.id },
            },
      ],
      type: 'SET_MAP',
    });

  const onReplace = ({ current, next }) => {
    const currentDestinationStorage = destinationStorages.find(
      (destinationStorage) => destinationStorage.name === current.destination,
    );
    const currentSourceStorage = sourceStorages?.find(
      (sourceStorage) => sourceStorage?.name === current.source,
    );

    const nextDestinationStorage = destinationStorages.find(
      (destinationStorage) => destinationStorage.name === next.destination,
    );
    const nextSourceStorage = sourceStorages?.find(
      (sourceStorage) => sourceStorage?.name === next.source,
    );

    // sanity check, names may not be valid
    if (!nextSourceStorage || !nextDestinationStorage) {
      return;
    }

    const nextMap: V1beta1StorageMapSpecMap =
      sourceProvider?.spec?.type === 'openshift'
        ? {
            destination: { storageClass: nextDestinationStorage.name },
            source: { name: nextSourceStorage.name },
          }
        : {
            destination: { storageClass: nextDestinationStorage.name },
            source: { id: nextSourceStorage.id },
          };

    const payload = state?.StorageMap?.spec?.map?.map((map) => {
      return map?.source?.id === currentSourceStorage?.id &&
        map.destination?.storageClass === currentDestinationStorage?.name
        ? nextMap
        : map;
    });

    dispatch({
      payload: payload ?? [],
      type: 'SET_MAP',
    });
  };

  const onDelete = (current: Mapping) => {
    const references = storageNameToIDReference(state?.StorageMap?.status?.references ?? []);
    const currentSourceStorage = sourceStorages?.find(
      (sourceStorage) => sourceStorage.name === current.source,
    );

    dispatch({
      payload: [
        ...(state?.StorageMap?.spec?.map.filter(
          (map) =>
            !(
              (map?.source?.id === currentSourceStorage?.id ||
                map?.source?.name === current.source ||
                map?.source?.id === references[current.source]) &&
              map.destination?.storageClass === current.destination
            ),
        ) ?? []),
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
            ...destinationStorages.map((destinationStorage) => destinationStorage?.name),
          ]}
          sources={sourceStorages.map((sourceStorage) => ({
            isMapped: isStorageMapped(sourceStorage?.id),
            label: sourceStorage.name,
            usedBySelectedVms: false,
          }))}
          mappings={state?.StorageMap?.spec?.map.map((storageMap) => ({
            destination: storageMap.destination.storageClass,
            source: getInventoryStorageName(storageMap.source.id) ?? storageMap.source?.name,
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

const storageNameToIDReference = (
  array: { id?: string; name?: string }[],
): Record<string, string> => {
  return array.reduce<Record<string, string>>((accumulator, current) => {
    if (current?.id && current?.name) {
      accumulator[current.name] = current.id;
    }
    return accumulator;
  }, {});
};
