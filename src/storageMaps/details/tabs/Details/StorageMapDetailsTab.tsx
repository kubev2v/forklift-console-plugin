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
} from '@kubev2v/types';
import { useK8sWatchResource, useModal } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from '@utils/crds/maps/selectors';

import DetailsSection from '../../components/DetailsSection/DetailsSection';
import StorageMapEdit, { type StorageMapEditProps } from '../../components/StorageMapEdit';

type StorageMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const StorageMapDetailsTab: FC<StorageMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const [storageMap, storageMapLoaded, storageMapLoadError] =
    useK8sWatchResource<V1beta1StorageMap>({
      groupVersionKind: StorageMapModelGroupVersionKind,
      isList: false,
      name,
      namespace,
      namespaced: true,
    });

  const [sourceProvider] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapSourceProviderName(storageMap),
    namespace: getMapSourceProviderNamespace(storageMap),
    namespaced: true,
  });
  const [sourceStorages] = useSourceStorages(sourceProvider);

  const [destinationProvider] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapDestinationProviderName(storageMap),
    namespace: getMapDestinationProviderNamespace(storageMap),
    namespaced: true,
  });

  const sourceStoragesMap = new Map(sourceStorages.map((storage) => [storage.id, storage]));

  return (
    <LoadingSuspend obj={storageMap} loaded={storageMapLoaded} loadError={storageMapLoadError}>
      <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
        <SectionHeading text={t('Storage map details')} />
        <DetailsSection obj={storageMap} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeadingWithEdit
          title={t('Providers')}
          onClick={() => {
            launcher<MapProvidersEditProps>(MapProvidersEdit, {
              destinationProvider,
              model: StorageMapModel,
              namespace,
              obj: storageMap,
              sourceProvider,
            });
          }}
        />
        <MapProvidersDetails obj={storageMap} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeadingWithEdit
          title={t('Map')}
          onClick={() => {
            launcher<StorageMapEditProps>(StorageMapEdit, {
              destinationProvider,
              sourceProvider,
              storageMap,
            });
          }}
        />
        <StorageMapReviewTable
          storageMap={
            getStorageMappingValues(storageMap?.spec?.map, sourceProvider, sourceStoragesMap) ?? []
          }
        />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={storageMap?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};
