import type { Draft } from 'immer';
import { universalComparator } from 'src/components/common/TableView/sort';

import type { CreateVmMigrationPageState } from '../types';

import {
  POD_NETWORK,
  SET_AVAILABLE_SOURCE_NETWORKS,
  SET_AVAILABLE_SOURCE_STORAGES,
  SET_AVAILABLE_TARGET_NETWORKS,
  SET_AVAILABLE_TARGET_STORAGES,
  SET_DISKS,
  SET_NICK_PROFILES,
} from './actions';

export const calculateNetworks = (
  draft: Draft<CreateVmMigrationPageState>,
): Partial<CreateVmMigrationPageState['calculatedPerNamespace']> => {
  const {
    calculatedOnce: { networkIdsUsedBySelectedVms, sourceNetworkLabelToId },
    calculatedPerNamespace: { networkMappings, sourceNetworks, targetNetworks },
    existingResources,
    flow: { initialLoading },
    underConstruction: { plan },
  } = draft;
  if (
    !initialLoading[SET_AVAILABLE_SOURCE_NETWORKS] ||
    !initialLoading[SET_NICK_PROFILES] ||
    !initialLoading[SET_AVAILABLE_TARGET_NETWORKS]
  ) {
    return {
      networkMappings,
      sourceNetworks,
      targetNetworks,
    };
  }

  const targetNetworkNameToUid = Object.fromEntries(
    existingResources.targetNetworks
      .filter(({ namespace }) => namespace === plan.spec.targetNamespace || namespace === 'default')
      .map((net) => [`${net.namespace}/${net.name}`, net.uid]),
  );
  const targetNetworkLabels = [
    POD_NETWORK,
    ...Object.keys(targetNetworkNameToUid).sort((a, b) => universalComparator(a, b, 'en')),
  ];
  const defaultDestination = POD_NETWORK;

  const generatedSourceNetworks = Object.keys(sourceNetworkLabelToId)
    .sort((a, b) => universalComparator(a, b, 'en'))
    .map((label) => {
      const usedBySelectedVms = networkIdsUsedBySelectedVms.some(
        (id) => id === sourceNetworkLabelToId[label] || id === label,
      );
      return {
        isMapped: usedBySelectedVms,
        label,
        usedBySelectedVms,
      };
    });

  return {
    networkMappings: generatedSourceNetworks
      .filter(({ usedBySelectedVms }) => usedBySelectedVms)
      .map(({ label }) => ({
        destination: defaultDestination,
        source: label,
      })),
    sourceNetworks: generatedSourceNetworks,
    targetNetworks: targetNetworkLabels,
  };
};

export const calculateStorages = (
  draft: Draft<CreateVmMigrationPageState>,
): Partial<CreateVmMigrationPageState['calculatedPerNamespace']> => {
  const {
    calculatedOnce: { sourceStorageLabelToId, storageIdsUsedBySelectedVms },
    calculatedPerNamespace: { sourceStorages, storageMappings, targetStorages },
    existingResources,
    flow: { initialLoading },
    underConstruction: { plan },
  } = draft;

  if (
    !initialLoading[SET_AVAILABLE_SOURCE_STORAGES] ||
    !initialLoading[SET_AVAILABLE_TARGET_STORAGES] ||
    !initialLoading[SET_DISKS]
  ) {
    // Wait for all resources
    return {
      sourceStorages,
      storageMappings,
      targetStorages,
    };
  }
  const filteredTargets = existingResources.targetStorages
    .filter(({ namespace }) => namespace === plan.spec.targetNamespace || !namespace)
    .sort((a, b) => universalComparator(a.name, b.name, 'en'));

  const targetTuples = filteredTargets
    .map((t): [string, string, boolean] => [
      t.name,
      t.uid,
      t?.object?.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true',
    ])
    .sort(([, , isDefault], [, , isOtherDefault]) => {
      // Always put the default at the top
      if (isDefault && !isOtherDefault) return -1;
      if (isOtherDefault && !isDefault) return 1;
      return 0;
    });

  const targetLabels = targetTuples.map(([name]) => name);
  const defaultDestination = targetLabels?.[0];

  const generatedSourceStorages = Object.keys(sourceStorageLabelToId)
    .sort((a, b) => universalComparator(a, b, 'en'))
    .map((label) => {
      const usedBySelectedVms = storageIdsUsedBySelectedVms.some(
        (id) => id === sourceStorageLabelToId[label] || id === label,
      );
      return {
        isMapped: usedBySelectedVms,
        label,
        usedBySelectedVms,
      };
    });

  return {
    sourceStorages: generatedSourceStorages,
    storageMappings: defaultDestination
      ? generatedSourceStorages
          .filter(({ usedBySelectedVms }) => usedBySelectedVms)
          .map(({ label }) => ({
            destination: defaultDestination,
            source: label,
          }))
      : [],
    targetStorages: targetLabels,
  };
};
