import { InventoryNetwork } from '../../../hooks/useNetworks';
import { InventoryStorage } from '../../../hooks/useStorages';

export const mapSourceNetworksToLabels = (
  sources: InventoryNetwork[],
): { [label: string]: string } => {
  const tuples: [string, string][] = sources
    .map((net): [string, string] => {
      switch (net.providerType) {
        case 'openshift': {
          return [`${net.namespace}/${net.name}`, net.uid];
        }
        case 'openstack': {
          return [net.name, net.id];
        }
        case 'ovirt': {
          return [net.path, net.id];
        }
        case 'vsphere': {
          return [net.name, net.id];
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

export const mapSourceStoragesToLabels = (
  sources: InventoryStorage[],
): { [label: string]: string } => {
  const tuples: [string, string][] = sources
    .map((storage): [string, string] => {
      switch (storage.providerType) {
        case 'openshift': {
          return [`${storage.namespace}/${storage.name}`, storage.uid];
        }
        case 'openstack': {
          return [storage.name, storage.id];
        }
        case 'ovirt': {
          return [storage.path ?? storage.name, storage.id];
        }
        case 'vsphere': {
          return [storage.name, storage.id];
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

const resolveCollisions = (tuples: [string, string][]): { [key: string]: string } =>
  tuples.reduce((acc, [label, id]) => {
    if (acc[label] === id) {
      //already included - no collisions
      return acc;
    } else if (acc[withSuffix(label, id)] === id) {
      //already included with suffix - there was a collision before
      return acc;
    } else if (acc[label]) {
      // resolve conflict
      return {
        // remove (filter out) existing label from keys list
        ...Object.fromEntries(Object.entries(acc).filter(([key]) => key !== label)),
        // existing entry: add suffix with ID
        [withSuffix(label, acc[label])]: acc[label],
        // new entry: create with suffix
        [withSuffix(label, id)]: id,
      };
    } else {
      // happy path
      return {
        ...acc,
        [label]: id,
      };
    }
  }, {});

const withSuffix = (label: string, id: string) => `${label}  (ID: ${id}})`;
