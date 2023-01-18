import * as React from 'react';
import { UseMutationResult, UseQueryResult, useQueryClient } from 'react-query';
import { usePollingContext } from '@app/common/context';
import {
  useMockableQuery,
  isSameResource,
  useMockableMutation,
  nameAndNamespace,
  mockKubeList,
  sortByName,
  truncateK8sString,
  getInventoryApiUrl,
} from './helpers';
import { MOCK_HOSTS, MOCK_HOST_CONFIGS } from './mocks/hosts.mock';
import { IHost, IHostConfig, INameNamespaceRef, ISecret, IVMwareProvider } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { IKubeList, IKubeResponse, KubeClientError } from '@app/client/types';
import { SelectNetworkFormValues } from '@app/Providers/components/VMwareProviderHostsTable/SelectNetworkModal';
import { createResource, createSecretResource, ForkliftResourceKind } from '@app/client/helpers';
import { CLUSTER_API_VERSION } from '@app/common/constants';
import { getObjectRef } from '@app/common/helpers';
import { isManagementNetworkSelected } from '@app/Providers/components/VMwareProviderHostsTable/helpers';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export const useHostsQuery = (provider: IVMwareProvider | null) => {
  const sortByNameCallback = React.useCallback((data): IHost[] => sortByName(data), []);
  const result = useMockableQuery<IHost[]>(
    {
      queryKey: ['hosts', provider?.selfLink],
      queryFn: async () =>
        await consoleFetchJSON(getInventoryApiUrl(`${provider?.selfLink || ''}/hosts?detail=1`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortByNameCallback,
    },
    MOCK_HOSTS
  );
  return result;
};

export const useHostConfigsQuery = (namespace: string): UseQueryResult<IKubeList<IHostConfig>> => {
  const hostConfigResource = createResource(ForkliftResourceKind.Host, namespace);
  return useMockableQuery<IKubeList<IHostConfig>>(
    {
      queryKey: 'host-configs',
      queryFn: async () => await consoleFetchJSON(hostConfigResource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
    },
    mockKubeList(MOCK_HOST_CONFIGS, 'Host')
  );
};

export const configMatchesHost = (
  config: IHostConfig,
  host: IHost,
  provider: IVMwareProvider
): boolean => isSameResource(config.spec.provider, provider) && host.id === config.spec.id;

export const getExistingHostConfigs = (
  selectedHosts: IHost[],
  allHostConfigs: IHostConfig[],
  provider: IVMwareProvider
): (IHostConfig | undefined)[] =>
  selectedHosts.map((host) =>
    allHostConfigs.find((config) => configMatchesHost(config, host, provider))
  );

const getHostConfigRef = (provider: IVMwareProvider, host: IHost) => ({
  name: truncateK8sString(provider.name, `-${host.id}-config`),
  namespace: provider.namespace,
});

const generateSecret = (
  values: SelectNetworkFormValues,
  secretBeingReusedRef: INameNamespaceRef | null,
  host: IHost,
  provider: IVMwareProvider,
  hostConfig?: IHostConfig
): ISecret => ({
  apiVersion: 'v1',
  data: {
    user: values.adminUsername && btoa(values.adminUsername),
    password: values.adminPassword && btoa(values.adminPassword),
  },
  kind: 'Secret',
  metadata: {
    ...(secretBeingReusedRef || {
      generateName: truncateK8sString(provider.name, `-${host.id}-`, true),
      namespace: provider.namespace,
    }),
    labels: {
      createdForResourceType: ForkliftResourceKind.Host,
      createdForResource: getHostConfigRef(provider, host).name,
    },
    ...(hostConfig
      ? {
          ownerReferences: [getObjectRef(hostConfig)],
        }
      : {}),
  },
  type: 'Opaque',
});

const generateHostConfig = (
  values: SelectNetworkFormValues,
  existingConfig: IHostConfig | null,
  host: IHost,
  provider: IVMwareProvider,
  secretRef: INameNamespaceRef | null
): IHostConfig => {
  const matchingNetworkAdapter = host.networkAdapters.find(
    ({ name }) => values.selectedNetworkAdapter?.name === name
  );
  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Host',
    metadata: {
      ...(existingConfig?.metadata || getHostConfigRef(provider, host)),
      ownerReferences: [getObjectRef(provider.object)],
    },
    spec: {
      id: host.id,
      ipAddress: matchingNetworkAdapter?.ipAddress || '',
      provider: nameAndNamespace(provider),
      secret: secretRef || null,
    },
  };
};

export const useConfigureHostsMutation = (
  provider: IVMwareProvider,
  selectedHosts: IHost[],
  allHostConfigs: IHostConfig[],
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<
  (IKubeResponse<IHostConfig> | null)[],
  KubeClientError,
  SelectNetworkFormValues,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  const secretResource = createSecretResource(namespace);
  const hostConfigResource = createResource(ForkliftResourceKind.Host, namespace);

  const configureHosts = (values: SelectNetworkFormValues) => {
    const existingHostConfigs = getExistingHostConfigs(selectedHosts, allHostConfigs, provider);
    const isMgmtSelected = isManagementNetworkSelected(
      selectedHosts,
      values.selectedNetworkAdapter
    );
    return Promise.all(
      selectedHosts.map(async (host, index) => {
        const existingConfig = existingHostConfigs[index] || null;
        const existingSecret = existingConfig?.spec.secret || null;

        if (isMgmtSelected) {
          if (existingConfig) {
            return client.delete<IHostConfig>(hostConfigResource, existingConfig.metadata.name);
          }
          return Promise.resolve(null); // No action needed if there is no Host CR and we're selecting the default network
        }

        // Create or update a secret CR
        const newSecret = generateSecret(values, existingSecret, host, provider);
        const secretResult = await (existingSecret
          ? client.patch<ISecret>(secretResource, existingSecret.name, newSecret)
          : client.create<ISecret>(secretResource, newSecret));
        const newSecretRef = nameAndNamespace(secretResult.data.metadata);

        // Create or update a host CR
        const newConfig = generateHostConfig(values, existingConfig, host, provider, newSecretRef);
        const hostResult = await (existingConfig
          ? client.patch<IHostConfig>(hostConfigResource, existingConfig.metadata.name, newConfig)
          : client.create<IHostConfig>(hostConfigResource, newConfig));

        // Patch the secret CR with an ownerReference to the host CR
        const updatedSecret = generateSecret(values, newSecretRef, host, provider, hostResult.data);
        await client.patch<ISecret>(secretResource, newSecretRef.name, updatedSecret);

        return hostResult;
      })
    );
  };

  return useMockableMutation<
    (IKubeResponse<IHostConfig> | null)[],
    KubeClientError,
    SelectNetworkFormValues
  >(configureHosts, {
    onSuccess: () => {
      queryClient.invalidateQueries('hosts');
      queryClient.invalidateQueries('hostconfigs');
      onSuccess && onSuccess();
    },
  });
};
