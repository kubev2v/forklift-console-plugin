import * as React from 'react';
import { Netmask } from 'netmask';
import { configMatchesHost, getExistingHostConfigs, useSecretQuery } from '@app/queries';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';
import { SelectNetworkFormState } from './SelectNetworkModal';

export const findHostConfig = (
  host: IHost,
  hostConfigs: IHostConfig[],
  provider: IVMwareProvider | null
): IHostConfig | null =>
  (provider && hostConfigs.find((config) => configMatchesHost(config, host, provider))) || null;

export const findSelectedNetworkAdapter = (
  host: IHost,
  hostConfig: IHostConfig | null
): IHostNetworkAdapter | null => {
  const managementNetwork =
    host.networkAdapters.find((adapter) =>
      new Netmask(adapter.ipAddress, adapter.subnetMask).contains(host.managementServerIp)
    ) || null;
  if (!hostConfig) return managementNetwork;
  return (
    host.networkAdapters.find((adapter) => adapter.ipAddress === hostConfig?.spec.ipAddress) ||
    managementNetwork
  );
};

export const isManagementNetworkSelected = (
  selectedHosts: IHost[],
  selectedNetwork: IHostNetworkAdapter | null
): boolean => {
  const allHostsHaveSameManagementNetwork = selectedHosts.every(
    (host) => host.managementServerIp === selectedHosts[0].managementServerIp
  );
  return (
    allHostsHaveSameManagementNetwork &&
    selectedNetwork?.ipAddress === selectedHosts[0].managementServerIp
  );
};

export const formatHostNetworkAdapter = (network: IHostNetworkAdapter): string => {
  if (network) {
    const netmask = new Netmask(network.ipAddress, network.subnetMask);
    return `${network.name} - ${netmask.toString()}`;
  }
  return 'Network not found';
};

interface IPrefillHostConfigEffect {
  isDonePrefilling: boolean;
}

export const usePrefillHostConfigEffect = (
  form: SelectNetworkFormState,
  selectedHosts: IHost[],
  hostConfigs: IHostConfig[],
  provider: IVMwareProvider
): IPrefillHostConfigEffect => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(false);
  const existingHostConfigs = getExistingHostConfigs(selectedHosts, hostConfigs, provider);
  const existingSecretName =
    (selectedHosts.length === 1 &&
      existingHostConfigs[0] &&
      existingHostConfigs[0].spec.secret?.name) ||
    null;
  const secretQuery = useSecretQuery(existingSecretName, provider.namespace);
  React.useEffect(() => {
    if (!isStartedPrefilling && (!existingSecretName || secretQuery.isSuccess)) {
      setIsStartedPrefilling(true);
      const existingIpAddresses = existingHostConfigs.map((config) => config?.spec.ipAddress);
      const allOnSameIp = Array.from(new Set(existingIpAddresses)).length === 1;
      const preselectedAdapter =
        (allOnSameIp &&
          selectedHosts[0].networkAdapters.find(
            (adapter) => adapter.ipAddress === existingIpAddresses[0]
          )) ||
        null;
      const secret = secretQuery.data;
      if (preselectedAdapter) {
        form.fields.selectedNetworkAdapter.prefill(preselectedAdapter);
      }
      if (secret) {
        form.fields.adminUsername.prefill(atob(secret.data.user || ''));
        form.fields.adminPassword.prefill(atob(secret.data.password || ''));
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    selectedHosts,
    existingHostConfigs,
    existingSecretName,
    form,
    secretQuery.data,
    secretQuery.isSuccess,
  ]);
  return { isDonePrefilling };
};
