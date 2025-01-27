import React from 'react';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { useOpenShiftStorages, useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { getNetworksUsedBySelectedVms } from 'src/modules/Providers/views/migrate/reducer/getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from 'src/modules/Providers/views/migrate/reducer/getStoragesUsedBySelectedVMs';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert } from '@patternfly/react-core';

import { getVMMigrationStatus } from '../../tabs/VirtualMachines/Migration/MigrationVirtualMachinesList';

import { PlanMappingsSection, PlanMappingsSectionState } from './PlanMappingsSection';

type PlanMappingsInitSectionProps = {
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

  const [vmData] = useInventoryVms(
    { provider: sourceProvider },
    providersLoaded,
    providersLoadError,
  );
  const migratedVmIds = plan?.status?.migration?.vms?.reduce((migrated, vm) => {
    if (getVMMigrationStatus(vm) === 'Succeeded') {
      migrated.push(vm.id);
    }
    return migrated;
  }, []);
  const migratedVms = vmData.filter((vm) => migratedVmIds?.includes(vm.vm.id));
  const networkIdsUsedByMigratedVms =
    sourceProvider?.spec?.type !== 'ovirt' ? getNetworksUsedBySelectedVms(migratedVms, []) : [];
  const storageIdsUsedByMigratedVms = ['ovirt', 'openstack'].includes(sourceProvider?.spec?.type)
    ? []
    : getStoragesUsedBySelectedVms({}, migratedVms, []);

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
        networkIdsUsedByMigratedVms={networkIdsUsedByMigratedVms}
        storageIdsUsedByMigratedVms={storageIdsUsedByMigratedVms}
      />
    </>
  );
};
