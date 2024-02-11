import { Base64 } from 'js-base64';

import {
  HostModel,
  NetworkAdapters,
  SecretModel,
  V1beta1Host,
  V1beta1Provider,
  V1Secret,
  VSphereHost,
} from '@kubev2v/types';
import { k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { createHost } from './createHost';
import { createHostSecret } from './createHostSecret';
import { InventoryHostPair } from './matchHostsToInventory';
import { patchHostSecretOwner } from './patchHostSecretOwner';

interface OnSaveHostParams {
  provider: V1beta1Provider;
  hostPairs: InventoryHostPair[];
  network: NetworkAdapters;
  user: string;
  password: string;
}

/**
 * Saves hosts data, including associated secrets, for a given set of host+secret pairs.
 * If a host already exists for a host pair, the host is updated with the new properties.
 * Otherwise, a new host and secret are created.
 *
 * @param {Params} params - The parameters for saving the host.
 */
export const onSaveHost = async ({
  provider,
  hostPairs,
  network,
  user,
  password,
}: OnSaveHostParams) => {
  const encodedUser = Base64.encode(user);
  const encodedPassword = Base64.encode(password);
  const encodedProvider = Base64.encode(provider.metadata.name);

  for (const hostPair of hostPairs) {
    // Look for the same network name in each host
    const hostNetwork = hostPair.inventory.networkAdapters.find(
      ({ name }) => name === network.name,
    );

    if (!hostNetwork) {
      throw new Error(`can't find network ${network.name} on host ${hostPair.host.metadata.name}`);
    }

    const encodedIpAddress = Base64.encode(hostNetwork.ipAddress);

    await processHostSecretPair(
      provider,
      hostPair,
      hostNetwork.ipAddress,
      encodedUser,
      encodedPassword,
      encodedProvider,
      encodedIpAddress,
    );
  }
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
async function processHostSecretPair(
  provider,
  hostPair,
  ipAddress,
  encodedUser,
  encodedPassword,
  encodedProvider,
  encodedIpAddress,
) {
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
      kind: 'Secret',
      apiVersion: 'v1',
      metadata: {
        generateName: `${provider.metadata.name}-${inventory.id}-`,
        namespace: provider.metadata.namespace,
        labels: {
          createdForResourceType: 'hosts',
          createdForResource: inventory.id,
        },
      },
      data: {
        ip: encodedIpAddress,
        password: encodedPassword,
        provider: encodedProvider,
        user: encodedUser,
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
            namespace: provider.metadata.namespace,
            uid: provider.metadata.uid,
          },
        ],
      },
      spec: {
        id: inventory.id,
        ipAddress: ipAddress,
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
}

async function getSecret(name: string, namespace: string) {
  const secret = await k8sGet<V1Secret>({ model: SecretModel, name, ns: namespace });
  return secret;
}

async function patchHost(host: V1beta1Host, ipAddress: string) {
  await k8sPatch({
    model: HostModel,
    resource: host,
    data: [
      {
        op: 'replace',
        path: '/spec/ipAddress',
        value: ipAddress,
      },
    ],
  });
}

async function patchSecret(
  secretData: V1Secret,
  encodedIpAddress: string,
  encodedUser: string,
  encodedPassword: string,
) {
  await k8sPatch({
    model: SecretModel,
    resource: secretData,
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
  });
}
