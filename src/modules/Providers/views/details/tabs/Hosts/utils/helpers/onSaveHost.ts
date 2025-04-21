import { Base64 } from 'js-base64';

import {
  HostModel,
  type IoK8sApiCoreV1Secret,
  type NetworkAdapters,
  SecretModel,
  type V1beta1Host,
  type V1beta1Provider,
  type VSphereHost,
} from '@kubev2v/types';
import { k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { createHost } from './createHost';
import { createHostSecret } from './createHostSecret';
import type { InventoryHostPair } from './matchHostsToInventory';
import { patchHostSecretOwner } from './patchHostSecretOwner';

type OnSaveHostParams = {
  provider: V1beta1Provider;
  hostPairs: InventoryHostPair[];
  network: NetworkAdapters;
  user?: string;
  password?: string;
};

/**
 * Saves hosts data, including associated secrets, for a given set of host+secret pairs.
 * If a host already exists for a host pair, the host is updated with the new properties.
 * Otherwise, a new host and secret are created.
 *
 * @param {Params} params - The parameters for saving the host.
 */
export const onSaveHost = async ({
  hostPairs,
  network,
  password,
  provider,
  user,
}: OnSaveHostParams) => {
  // user and password can be undefined for ESXi provider
  // Base64.encode will not handle undefined values
  const encodedUser = user ? Base64.encode(user) : undefined;
  const encodedPassword = password ? Base64.encode(password) : undefined;

  const encodedProvider = Base64.encode(provider.metadata.name);

  const promises = hostPairs.map(async (hostPair) => {
    // Look for the same network name in each host
    const hostNetwork = hostPair.inventory.networkAdapters.find(
      ({ name }) => name === network.name,
    );

    if (!hostNetwork) {
      throw new Error(`can't find network ${network.name} on host ${hostPair.host.metadata.name}`);
    }

    const encodedIpAddress = Base64.encode(hostNetwork.ipAddress);

    return processHostSecretPair(
      provider,
      hostPair,
      hostNetwork.ipAddress,
      encodedUser,
      encodedPassword,
      encodedProvider,
      encodedIpAddress,
    );
  });
  await Promise.all(promises);
};

/**
 * Processes a host pair, creating or updating a host and associated secret as needed.
 *
 * @param {V1beta1Provider} provider - The provider of the hosts.
 * @param {InventoryHostPair} hostPair - The host pair to process.
 * @param {string} user - The username to set on the host.
 * @param {string} password - The password to set on the host.
 * @param {string} encodedUser - The Base64 encoded username.
 * @param {string} encodedPassword - The Base64 encoded password.
 * @param {string} encodedProvider - The Base64 encoded provider.
 * @param {string} encodedIpAddress - The Base64 encoded IP address.
 */
const processHostSecretPair = async (
  provider,
  hostPair,
  ipAddress,
  encodedUser,
  encodedPassword,
  encodedProvider,
  encodedIpAddress,
) => {
  const { host, inventory }: { host: V1beta1Host; inventory: VSphereHost } = hostPair;

  if (host?.metadata?.name) {
    // Host already set, update network in the host and secret
    const { name: secretName, namespace: secretNamespace } = host.spec.secret;

    const secretData = await getSecret(secretName, secretNamespace);

    await patchHost(host, ipAddress);
    await patchSecret(secretData, encodedIpAddress, encodedUser, encodedPassword);
  } else {
    // Create a new host and secret pair

    // Create a Secret
    const secretData = {
      apiVersion: 'v1',
      data: {
        ip: encodedIpAddress,
        password: encodedPassword,
        provider: encodedProvider,
        user: encodedUser,
      },
      kind: 'Secret',
      metadata: {
        generateName: `${provider.metadata.name}-${inventory.id}-`,
        labels: {
          createdForResource: inventory.id,
          createdForResourceType: 'hosts',
        },
        namespace: provider.metadata.namespace,
      },
      type: 'Opaque',
    };
    const createdSecret = await createHostSecret(secretData);

    // Create Host
    const newHostData = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Host',
      metadata: {
        name: `${provider.metadata.name}-${inventory.id}-config`,
        namespace: provider.metadata.namespace,
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            name: provider.metadata.name,
            uid: provider.metadata.uid,
          },
        ],
      },
      spec: {
        id: inventory.id,
        ipAddress,
        provider: {
          name: provider.metadata.name,
          namespace: provider.metadata.namespace,
        },
        secret: {
          name: createdSecret.metadata.name,
          namespace: createdSecret.metadata.namespace,
        },
      },
    };
    const createdHost = await createHost(newHostData);

    // Patch Secret owner Ref
    const ownerRef = {
      name: createdHost.metadata.name,
      uid: createdHost.metadata.uid,
    };
    await patchHostSecretOwner(createdSecret, ownerRef);
  }
};

const getSecret = async (name: string, namespace: string) => {
  const secret = await k8sGet<IoK8sApiCoreV1Secret>({ model: SecretModel, name, ns: namespace });
  return secret;
};

const patchHost = async (host: V1beta1Host, ipAddress: string) => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/ipAddress',
        value: ipAddress,
      },
    ],
    model: HostModel,
    resource: host,
  });
};

const patchSecret = async (
  secretData: IoK8sApiCoreV1Secret,
  encodedIpAddress: string,
  encodedUser: string,
  encodedPassword: string,
) => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/data/ip',
        value: encodedIpAddress,
      },
      {
        op: 'replace',
        path: '/data/user',
        value: encodedUser,
      },
      {
        op: 'replace',
        path: '/data/password',
        value: encodedPassword,
      },
    ],
    model: SecretModel,
    resource: secretData,
  });
};
