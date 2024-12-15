import React, { useEffect, useReducer } from 'react';
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
import { Alert, PageSection } from '@patternfly/react-core';

import {
  PlanMappingsSection,
  planMappingsSectionReducer,
  PlanMappingsSectionState,
} from './PlanMappingsSection';

export type PlanMappingsInitSectionProps = {
  plan: V1beta1Plan;
  loaded?: boolean;
  loadError?: unknown;
  planMappingsState: PlanMappingsSectionState;
  planMappingsDispatch: React.Dispatch<{
    type: string;
    payload?;
  }>;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
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

  const initialState: PlanMappingsSectionState = {
    edit: false,
    dataChanged: false,
    alertMessage: null,
    updatedNetwork: planNetworkMaps?.spec?.map || [],
    updatedStorage: planStorageMaps?.spec?.map || [],
    planNetworkMaps: planNetworkMaps,
    planStorageMaps: planStorageMaps,
  };

  const [state, dispatch] = useReducer(planMappingsSectionReducer, initialState);

  useEffect(() => {
    if (planNetworkMaps && planStorageMaps) {
      dispatch({
        type: 'SET_PLAN_MAPS',
        payload: { planNetworkMaps, planStorageMaps },
      });
    }
  }, [planNetworkMaps, planStorageMaps]);

  const checkResources = () => {
    if (!networkMapsLoaded || !storageMapsLoaded) {
      return (
        <div>
          <span className="text-muted">{t('Data is loading, please wait.')}</span>
        </div>
      );
    }

    if (networkMapsError || storageMapsError) {
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

    if (networkMaps.length == 0 || storageMaps.length == 0)
      return (
        <div>
          <span className="text-muted">{t('No Mapping found.')}</span>
        </div>
      );

    return null;
  };

  return (
    <>
      <div>
        <PageSection variant="light">
          <SectionHeading text={t('Mappings')} />
          {checkResources() ?? (
            <PlanMappingsInitSection
              plan={plan}
              loaded={loaded}
              loadError={loadError}
              planMappingsState={state}
              planMappingsDispatch={dispatch}
              planNetworkMaps={planNetworkMaps}
              planStorageMaps={planStorageMaps}
            />
          )}
        </PageSection>
      </div>
    </>
  );
};

export const PlanMappingsInitSection: React.FC<PlanMappingsInitSectionProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { plan, planMappingsState, planMappingsDispatch, planNetworkMaps, planStorageMaps } = props;

  // Retrieve all k8s Providers
  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

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

  // Warn when missing inventory data, missing inventory will make
  // some editing options missing.
  const alerts = [];

  if (targetStorages.length == 0) {
    // Note: target network can't be missing, we always have Pod network.
    alerts.push('Missing target storage inventory.');
  }

  if (sourceStorages.length == 0 || sourceNetworks.length == 0) {
    alerts.push('Missing storage inventory.');
  }

  return (
    <>
      {alerts.map((alert) => (
        <div className="forklift-page-section-alerts" key={alert}>
          <Alert variant="warning" title={alert} />
        </div>
      ))}
      <PlanMappingsSection
        plan={plan}
        planNetworkMaps={planNetworkMaps}
        planStorageMaps={planStorageMaps}
        sourceNetworks={sourceNetworks}
        targetNetworks={targetNetworks}
        sourceStorages={sourceStorages}
        targetStorages={targetStorages}
        planMappingsState={planMappingsState}
        planMappingsDispatch={planMappingsDispatch}
      />
    </>
  );
};
