import React from 'react';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { useOpenShiftStorages, useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { PlanMappingsSection } from './PlanMappingsSection';

export type PlanMappingsInitSectionProps = {
  plan: V1beta1Plan;
  loaded: boolean;
  loadError: unknown;
};

export const PlanMappings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();

  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  return (
    <>
      <div>
        <PageSection variant="light">
          <SectionHeading text={t('Mappings')} />
          <PlanMappingsInitSection plan={plan} loaded={loaded} loadError={loadError} />
        </PageSection>
      </div>
    </>
  );
};

const PlanMappingsInitSection: React.FC<PlanMappingsInitSectionProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { plan } = props;

  // Retrieve all k8s Providers
  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  // Retrieve all k8s Network Mappings
  const [networkMaps, networkMapsLoaded, networkMapsError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  // Retrieve all k8s Storage Mappings
  const [storageMaps, storageMapsLoaded, storageMapsError] = useK8sWatchResource<
    V1beta1StorageMap[]
  >({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  const planNetworkMaps = networkMaps
    ? networkMaps.find((net) => net?.metadata?.name === plan?.spec?.map?.network?.name)
    : null;
  const planStorageMaps = storageMaps
    ? storageMaps.find((storage) => storage?.metadata?.name === plan.spec.map?.storage?.name)
    : null;
  const sourceProvider: V1beta1Provider = providers
    ? providers.find((p) => p?.metadata?.name === plan?.spec?.provider?.source?.name)
    : null;
  const targetProvider = providers
    ? providers.find((p) => p?.metadata?.name === plan?.spec?.provider?.destination?.name)
    : null;

  // Retrieve source and target providers Mappings from the inventory
  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  const [sourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);

  if (
    !networkMapsLoaded ||
    !storageMapsLoaded ||
    !providersLoaded ||
    sourceNetworksLoading ||
    targetNetworksLoading ||
    sourceStoragesLoading ||
    targetStoragesLoading
  ) {
    return (
      <div>
        <span className="text-muted">{t('Data is loading, please wait.')}</span>
      </div>
    );
  }

  if (
    networkMapsError ||
    storageMapsError ||
    providersLoadError ||
    sourceNetworksError ||
    targetNetworksError ||
    sourceStoragesError ||
    targetStoragesError
  ) {
    return (
      <div>
        <span className="text-muted">
          {t(
            'Something is wrong, the data was not loaded due to an error, please try to reload the page.',
          )}
        </span>
      </div>
    );
  }

  if (
    networkMaps.length == 0 ||
    storageMaps.length == 0 ||
    sourceNetworks.length == 0 ||
    targetNetworks.length == 0 ||
    sourceStorages.length == 0 ||
    targetStorages.length == 0
  )
    return (
      <div>
        <span className="text-muted">{t('No Mapping found.')}</span>
      </div>
    );

  return (
    <PlanMappingsSection
      plan={plan}
      planNetworkMaps={planNetworkMaps}
      planStorageMaps={planStorageMaps}
      sourceNetworks={sourceNetworks}
      targetNetworks={targetNetworks}
      sourceStorages={sourceStorages}
      targetStorages={targetStorages}
    />
  );
};
