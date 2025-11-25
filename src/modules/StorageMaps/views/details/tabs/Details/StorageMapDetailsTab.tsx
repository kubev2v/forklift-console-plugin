import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import StorageMapReviewTable from 'src/plans/create/steps/review/StorageMapReviewTable';
import { buildFormStorageMapping } from 'src/storageMaps/create/utils/buildStorageMappings';
import StorageMapEdit, { type StorageMapEditProps } from 'src/storageMaps/details/StorageMapEdit';
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
} from '@utils/crds/maps/selectors';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import DetailsSection from '../../components/DetailsSection/DetailsSection';

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
    namespace,
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
            buildFormStorageMapping(storageMap?.spec?.map, sourceProvider, sourceStoragesMap) ?? []
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
