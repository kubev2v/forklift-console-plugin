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
import { k8sCreate, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { InventoryHostPair } from './matchHostsToInventory';

interface OnSaveHostParams {
  provider: V1beta1Provider;
  hostPairs: InventoryHostPair[];
  network: NetworkAdapters;
  user: string;
  password: string;
}

/**
 * Saves host data, including associated secrets, for a given set of host pairs.
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
    const encodedIpAddress = Base64.encode(hostNetwork.ipAddress);

    if (!hostNetwork) {
      throw new Error(`can't find network ${network.name} on host ${hostPair.host.metadata.name}`);
    }

    await processHostPair(
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
async function processHostPair(
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
    const { name: secretName, namespace: secretNamespace } = host.spec.secret;

    const secretData = await getSecret(secretName, secretNamespace);

    await patchHost(host, ipAddress);
    await patchSecret(secretData, encodedIpAddress, encodedUser, encodedPassword);
  } else {
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
        secret: {},
      },
    };
    const createdHost = await createHost(newHostData);

    const secretData = {
      kind: 'Secret',
      apiVersion: 'v1',
      metadata: {
        generateName: `${provider.metadata.name}-${inventory.id}-`,
        namespace: provider.metadata.namespace,
        labels: {
          createdForResourceType: 'hosts',
        },
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Host',
            name: createdHost.metadata.name,
            uid: createdHost.metadata.uid,
          },
        ],
      },
      data: {
        ip: encodedIpAddress,
        password: encodedPassword,
        provider: encodedProvider,
        user: encodedUser,
      },
      type: 'Opaque',
    };
    const createdSecret = await createSecret(secretData);

    const secretRef = {
      name: createdSecret.metadata.name,
      namespace: createdSecret.metadata.namespace,
    };
    await patchHostSecret(createdHost, secretRef);
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

async function createSecret(secretData: V1Secret) {
  const createdSecret = await k8sCreate({
    model: SecretModel,
    data: secretData,
  });
  return createdSecret;
}

async function createHost(newHostData: V1beta1Host) {
  const createdHost = await k8sCreate({
    model: HostModel,
    data: newHostData,
  });
  return createdHost;
}

async function patchHostSecret(host: V1beta1Host, secretRef: { name: string; namespace: string }) {
  await k8sPatch({
    model: HostModel,
    resource: host,
    data: [
      {
        op: 'replace',
        path: '/spec/secret',
        value: {
          name: secretRef.name,
          namespace: secretRef.namespace,
        },
      },
    ],
  });
}
