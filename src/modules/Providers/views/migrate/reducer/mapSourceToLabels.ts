import type { InventoryNetwork } from '../../../hooks/useNetworks';
import type { InventoryStorage } from '../../../hooks/useStorages';

export const mapSourceNetworksToLabels = (sources: InventoryNetwork[]): Record<string, string> => {
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
        case 'ova': {
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

export const mapSourceStoragesToLabels = (sources: InventoryStorage[]): Record<string, string> => {
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
        case 'ova': {
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

const resolveCollisions = (tuples: [string, string][]): Record<string, string> =>
  tuples.reduce((acc, [label, id]) => {
    if (acc[label] === id) {
      //Already included - no collisions
      return acc;
    } else if (acc[withSuffix(label, id)] === id) {
      //Already included with suffix - there was a collision before
      return acc;
    } else if (acc[label]) {
      // Resolve conflict
      return {
        // Remove (filter out) existing label from keys list
        ...Object.fromEntries(Object.entries(acc).filter(([key]) => key !== label)),
        // Existing entry: add suffix with ID
        [withSuffix(label, acc[label])]: acc[label],
        // New entry: create with suffix
        [withSuffix(label, id)]: id,
      };
    }
    // Happy path
    return {
      ...acc,
      [label]: id,
    };
  }, {});

const withSuffix = (label: string, id: string) => `${label}  (ID: ${id}})`;
