import { encode } from 'js-base64';

import {
  type IoK8sApiCoreV1Secret,
  type NetworkAdapters,
  SecretModel,
  type V1beta1Host,
  type V1beta1Provider,
  type VSphereHostInventory,
} from '@kubev2v/types';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';

import { createHost } from './createHost';
import { createHostSecret } from './createHostSecret';
import { patchHost } from './patchHost';
import { patchHostSecretOwner } from './patchHostSecretOwner';
import { patchSecret } from './patchSecret';
import type { InventoryHostNetworkTriple } from './types';

type OnSaveHostParams = {
  provider: V1beta1Provider;
  hostPairs: InventoryHostNetworkTriple[];
  network: NetworkAdapters;
  user?: string;
  passwd?: string;
};

const processHostSecretPair = async (
  provider: V1beta1Provider,
  hostPair: InventoryHostNetworkTriple,
  ipAddress: string,
  encodedUser?: string,
  encodedPassword?: string,
) => {
  const { host } = hostPair;
  const inventory: VSphereHostInventory = hostPair.inventory;

  const encodedProvider = encode(getName(provider) ?? '');
  const encodedIpAddress = encode(ipAddress);

  if (host && getName(host)) {
    // Host already set, update network in the host and secret
    const { name: secretName, namespace: secretNamespace } = host?.spec?.secret ?? {};

    const secretData = await k8sGet<IoK8sApiCoreV1Secret>({
      model: SecretModel,
      name: secretName,
      ns: secretNamespace,
    });

    await patchHost(host, ipAddress);
    await patchSecret(secretData, encodedIpAddress, encodedUser, encodedPassword);

    return;
  }

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
      generateName: `${getName(provider)}-${inventory.id}-`,
      labels: {
        createdForResource: inventory.id,
        createdForResourceType: 'hosts',
      },
      namespace: getNamespace(provider),
    },
    type: 'Opaque',
  };
  const createdSecret = await createHostSecret(secretData as IoK8sApiCoreV1Secret);

  // Create Host
  const newHostData = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Host',
    metadata: {
      name: `${getName(provider)}-${inventory.id}-config`,
      namespace: getNamespace(provider),
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Provider',
          name: getName(provider),
          uid: getUID(provider),
        },
      ],
    },
    spec: {
      id: inventory.id,
      ipAddress,
      provider: {
        name: getName(provider),
        namespace: getNamespace(provider),
      },
      secret: {
        name: getName(createdSecret),
        namespace: getNamespace(createdSecret),
      },
    },
  };
  const createdHost = await createHost(newHostData as V1beta1Host);

  // Patch Secret owner Ref
  const ownerRef = {
    name: getName(createdHost),
    uid: getUID(createdHost),
  };
  await patchHostSecretOwner(createdSecret, ownerRef);
};

/**
 * Saves hosts data, including associated secrets, for a given set of host+secret pairs.
 * If a host already exists for a host pair, the host is updated with the new properties.
 * Otherwise, a new host and secret are created.
 */
export const onSaveHost = async ({
  hostPairs,
  network,
  passwd,
  provider,
  user,
}: OnSaveHostParams) => {
  const encodedUser = user && encode(user);
  const encodedPassword = passwd && encode(passwd);

  const promises = hostPairs.map(async (hostPair) => {
    const inventory: VSphereHostInventory = hostPair.inventory;

    // Look for the same network name in each host
    const hostNetwork = inventory?.networkAdapters?.find(({ name }) => name === network.name);

    if (!hostNetwork) {
      throw new Error(`can't find network ${network.name} on host ${getName(hostPair?.host)}`);
    }

    return processHostSecretPair(
      provider,
      hostPair,
      hostNetwork?.ipAddress,
      encodedUser,
      encodedPassword,
    );
  });
  await Promise.all(promises);
};
