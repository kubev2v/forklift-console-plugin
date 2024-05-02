import { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1Plan,
} from '@kubev2v/types';

import { POD_NETWORK } from './constants';

const resolveCollisions = (tuples: [string, string][]): { [key: string]: string } =>
  tuples.reduce((acc, [label, id]) => {
    if (acc[label] === id) {
      //already included - no collisions
      return acc;
    } else if (acc[`${label}`] === id) {
      //already included with suffix - there was a collision before
      return acc;
    } else if (acc[label]) {
      // resolve conflict
      return {
        // remove (filter out) existing label from keys list
        ...Object.fromEntries(Object.entries(acc).filter(([key]) => key !== label)),
        // existing entry: add suffix with ID
        [`${label}`]: acc[label],
        // new entry: create with suffix
        [`${label}`]: id,
      };
    } else {
      return {
        ...acc,
        [label]: id,
      };
    }
  }, {});

export const mapSourceNetworksIdsToLabels = (
  sources: InventoryNetwork[],
): { [label: string]: string } => {
  const tuples: [string, string][] = sources
    .map((net): [string, string] => {
      switch (net.providerType) {
        case 'openshift': {
          return [net.uid, `${net.namespace}/${net.name}`];
        }
        case 'openstack': {
          return [net.id, net.name];
        }
        case 'ovirt': {
          return [net.id, net.path];
        }
        case 'vsphere': {
          return [net.id, net.name];
        }
        case 'ova': {
          return [net.id, net.name];
        }
        default: {
          return undefined;
        }
      }
    })
    .filter(Boolean);
  const labelToId = resolveCollisions(tuples);
  return labelToId;
};

export const mapSourceStoragesIdsToLabels = (
  sources: InventoryStorage[],
): { [label: string]: string } => {
  const tuples: [string, string][] = sources
    .map((storage): [string, string] => {
      switch (storage.providerType) {
        case 'openshift': {
          return [storage.uid, `${storage.namespace}/${storage.name}`];
        }
        case 'openstack': {
          return [storage.id, storage.name];
        }
        case 'ovirt': {
          return [storage.id, storage.path ?? storage.name];
        }
        case 'vsphere': {
          return [storage.id, storage.name];
        }
        case 'ova': {
          return [storage.id, storage.name];
        }
        default: {
          return undefined;
        }
      }
    })
    .filter(Boolean);
  const labelToId = resolveCollisions(tuples);

  return labelToId;
};

export const mapTargetNetworksIdsToLabels = (
  targets: OpenShiftNetworkAttachmentDefinition[],
  plan: V1beta1Plan,
): { [label: string]: string } => {
  const tuples: [string, string][] = targets
    .filter(({ namespace }) => namespace === plan.spec.targetNamespace || namespace === 'default')
    .map((net) => [net.uid, net.name]);

  tuples.push(['pod', POD_NETWORK]);
  const labelToId = resolveCollisions(tuples);
  return labelToId;
};

export const mapTargetStoragesLabelsToIds = (
  targets: OpenShiftStorageClass[],
  plan: V1beta1Plan,
): { [label: string]: string } => {
  const tuples: [string, string][] = targets
    .filter(({ namespace }) => namespace === plan.spec.targetNamespace || !namespace)
    .map((storage): [string, string] => [storage.name, storage.uid]);
  tuples.push(['standard', 'standard']);
  const labelToId = resolveCollisions(tuples);
  return labelToId;
};
