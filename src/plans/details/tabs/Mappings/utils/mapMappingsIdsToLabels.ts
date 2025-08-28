import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { POD } from 'src/plans/details/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1Plan,
} from '@kubev2v/types';
import { Namespace } from '@utils/constants';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';

import { DefaultNetworkLabel, IgnoreNetwork, STANDARD } from './constants';

const resolveCollisions = (tuples: [string, string][]): Record<string, string> =>
  tuples.reduce<Record<string, string>>((acc, [label, id]) => {
    if (acc[label] === id) {
      //already included - no collisions
      return acc;
    } else if (acc[label]) {
      // resolve conflict
      return {
        // remove (filter out) existing label from keys list
        ...Object.fromEntries(Object.entries(acc).filter(([key]) => key !== label)),
        // existing entry: add suffix with ID
        [label]: acc[label],
        // new entry: create with suffix
        [label]: id,
      };
    }
    return {
      ...acc,
      [label]: id,
    };
  }, {});

export const mapSourceNetworksIdsToLabels = (
  sources: InventoryNetwork[],
): Record<string, string> => {
  const tuples: [string, string][] = sources
    .map((net): [string, string] => {
      switch (net.providerType) {
        case PROVIDER_TYPES.openshift: {
          return [net.uid, `${net.namespace}/${net.name}`];
        }
        case PROVIDER_TYPES.openstack: {
          return [net.id, net.name];
        }
        case PROVIDER_TYPES.ovirt: {
          return [net.id, net.path!];
        }
        case PROVIDER_TYPES.vsphere: {
          return [net.id, net.name];
        }
        case PROVIDER_TYPES.ova: {
          return [net.id, net.name];
        }
        default: {
          return ['', ''];
        }
      }
    })
    .filter(Boolean);

  const labelToId = resolveCollisions(tuples);
  return labelToId;
};

export const mapSourceStoragesIdsToLabels = (
  sources: InventoryStorage[],
): Record<string, string> => {
  const tuples: [string, string][] = sources
    .map((storage): [string, string] => {
      switch (storage.providerType) {
        case PROVIDER_TYPES.openshift: {
          return [storage.uid, `${storage.namespace}/${storage.name}`];
        }
        case PROVIDER_TYPES.openstack: {
          return [storage.id, storage.name];
        }
        case PROVIDER_TYPES.ovirt: {
          return [storage.id, storage.path ?? storage.name];
        }
        case PROVIDER_TYPES.vsphere: {
          return [storage.id, storage.name];
        }
        case PROVIDER_TYPES.ova: {
          return [storage.id, storage.name];
        }
        default: {
          return ['', ''];
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
): Record<string, string> => {
  const tuples: [string, string][] = targets
    .filter(
      ({ namespace }) =>
        namespace === getPlanTargetNamespace(plan) || namespace === Namespace.Default,
    )
    .map((net) => [net.uid, `${net.namespace}/${net.name}`]);

  tuples.push([POD, DefaultNetworkLabel.Source], [IgnoreNetwork.Type, IgnoreNetwork.Label]);
  const labelToId = resolveCollisions(tuples);
  return labelToId;
};

export const mapTargetStoragesLabelsToIds = (
  targets: OpenShiftStorageClass[],
  plan: V1beta1Plan,
): Record<string, string> => {
  const tuples: [string, string][] = targets
    .filter(({ namespace }) => namespace === getPlanTargetNamespace(plan) || !namespace)
    .map((storage): [string, string] => [storage.name, storage.uid]);
  tuples.push([STANDARD, STANDARD]);
  const labelToId = resolveCollisions(tuples);
  return labelToId;
};
