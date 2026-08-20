import type { FC } from 'react';
import { ConditionsSection } from 'src/components/ConditionsSection/ConditionsSection';
import SectionHeading from 'src/components/headers/SectionHeading';
import StorageMapReviewTable from 'src/plans/create/steps/review/StorageMapReviewTable';
import { getStorageMappingValues } from 'src/storageMaps/create/utils/buildStorageMappings';
import { useSourceStorages } from 'src/utils/hooks/useStorages';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import LoadingSuspend from '@components/LoadingSuspend';
import MapProvidersDetails from '@components/MapProvidersDetails/MapProvidersDetails';
import MapProvidersEdit from '@components/MapProvidersDetails/MapProvidersEdit';
import type { MapProvidersEditProps } from '@components/MapProvidersDetails/utils/types';
import {
  ProviderModelGroupVersionKind,
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { useK8sWatchResource, useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from '@utils/crds/maps/selectors';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

import DetailsSection from '../../components/DetailsSection/DetailsSection';
import StorageMapEdit, { type StorageMapEditProps } from '../../components/StorageMapEdit';

type StorageMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const StorageMapDetailsTab: FC<StorageMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const [storageMap, storageMapLoaded, storageMapLoadError] = toTypedWatchResult(
    useK8sWatchResource<V1beta1StorageMap>({
      groupVersionKind: StorageMapModelGroupVersionKind,
      isList: false,
      name,
      namespace,
      namespaced: true,
    }),
  );

  const [sourceProvider] = toTypedWatchResult(
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getMapSourceProviderName(storageMap),
      namespace: getMapSourceProviderNamespace(storageMap),
      namespaced: true,
    }),
  );
  const [sourceStorages] = useSourceStorages(sourceProvider);

  const [destinationProvider] = toTypedWatchResult(
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getMapDestinationProviderName(storageMap),
      namespace: getMapDestinationProviderNamespace(storageMap),
      namespaced: true,
    }),
  );

  const sourceStoragesMap = new Map(sourceStorages.map((storage) => [storage.id, storage]));

  return (
    <LoadingSuspend loaded={storageMapLoaded} loadError={storageMapLoadError} obj={storageMap}>
      <PageSection className="forklift-page-section--details" hasBodyWrapper={false}>
        <SectionHeading text={t('Storage map details')} />
        <DetailsSection obj={storageMap} />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeadingWithEdit
          onClick={() => {
            launchOverlay<MapProvidersEditProps>(MapProvidersEdit, {
              destinationProvider,
              model: StorageMapModel,
              namespace,
              obj: storageMap,
              sourceProvider,
            });
          }}
          title={t('Providers')}
        />
        <MapProvidersDetails obj={storageMap} />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeadingWithEdit
          data-testid="storage-map-edit-button"
          onClick={() => {
            launchOverlay<StorageMapEditProps>(StorageMapEdit, {
              destinationProvider,
              sourceProvider,
              storageMap,
            });
          }}
          title={t('Map')}
        />
        <StorageMapReviewTable
          storageMap={
            getStorageMappingValues(storageMap?.spec?.map, sourceProvider, sourceStoragesMap) ?? []
          }
        />
      </PageSection>

      <PageSection className="forklift-page-section" hasBodyWrapper={false}>
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={storageMap?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};
