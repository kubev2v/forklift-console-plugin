import { Draft } from 'immer';

import { universalComparator } from '@kubev2v/common';

import { CreateVmMigrationPageState } from '../types';

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
    existingResources,
    underConstruction: { plan },
    calculatedOnce: { sourceNetworkLabelToId, networkIdsUsedBySelectedVms },
    calculatedPerNamespace: { sourceNetworks, targetNetworks, networkMappings },
    flow: { initialLoading },
  } = draft;
  if (
    !initialLoading[SET_AVAILABLE_SOURCE_NETWORKS] ||
    !initialLoading[SET_NICK_PROFILES] ||
    !initialLoading[SET_AVAILABLE_TARGET_NETWORKS]
  ) {
    return {
      sourceNetworks,
      targetNetworks,
      networkMappings,
    };
  }

  const targetNetworkNameToUid = Object.fromEntries(
    existingResources.targetNetworks
      .filter(({ namespace }) => namespace === plan.spec.targetNamespace)
      .map((net) => [net.name, net.uid]),
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
        (id) => id === sourceNetworkLabelToId[label],
      );
      return {
        label,
        usedBySelectedVms,
        isMapped: usedBySelectedVms,
      };
    });

  return {
    targetNetworks: targetNetworkLabels,
    sourceNetworks: generatedSourceNetworks,
    networkMappings: generatedSourceNetworks
      .filter(({ usedBySelectedVms }) => usedBySelectedVms)
      .map(({ label }) => ({
        source: label,
        destination: defaultDestination,
      })),
  };
};

export const calculateStorages = (
  draft: Draft<CreateVmMigrationPageState>,
): Partial<CreateVmMigrationPageState['calculatedPerNamespace']> => {
  const {
    existingResources,
    underConstruction: { plan },
    calculatedOnce: { sourceStorageLabelToId, storageIdsUsedBySelectedVms },
    calculatedPerNamespace: { storageMappings, targetStorages, sourceStorages },
    flow: { initialLoading },
  } = draft;

  if (
    !initialLoading[SET_AVAILABLE_SOURCE_STORAGES] ||
    !initialLoading[SET_AVAILABLE_TARGET_STORAGES] ||
    !initialLoading[SET_DISKS]
  ) {
    // wait for all resources
    return {
      storageMappings,
      targetStorages,
      sourceStorages,
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
        (id) => id === sourceStorageLabelToId[label],
      );
      return {
        label,
        usedBySelectedVms,
        isMapped: usedBySelectedVms,
      };
    });

  return {
    targetStorages: targetLabels,
    sourceStorages: generatedSourceStorages,
    storageMappings: defaultDestination
      ? generatedSourceStorages
          .filter(({ usedBySelectedVms }) => usedBySelectedVms)
          .map(({ label }) => ({
            source: label,
            destination: defaultDestination,
          }))
      : [],
  };
};
