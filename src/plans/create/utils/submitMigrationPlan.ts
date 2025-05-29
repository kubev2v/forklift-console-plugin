import { NetworkMapModel, StorageMapModel } from '@kubev2v/types';

import type { CreatePlanFormData } from '../types';

import { addOwnerRef } from './addOwnerRef';
import { createNetworkMap } from './createNetworkMap';
import { createPlan } from './createPlan';
import { createStorageMap } from './createStorageMap';

/**
 * Handles the plan submission process including creation of network map, storage map,
 * plan, and establishing owner references.
 */
export const submitMigrationPlan = async (formData: CreatePlanFormData): Promise<void> => {
  const {
    existingNetworkMap,
    existingStorageMap,
    networkMap: newNetworkMap,
    networkMapName,
    planName,
    planProject,
    sourceProvider,
    storageMap: newStorageMap,
    storageMapName,
    targetProvider,
    vms,
  } = formData;

  let planNetworkMap = existingNetworkMap!;
  let planStorageMap = existingStorageMap!;

  // Create network map only if no existing network map is provided
  if (!existingNetworkMap) {
    planNetworkMap = await createNetworkMap({
      mappings: newNetworkMap,
      name: networkMapName,
      planProject,
      sourceProvider,
      targetProvider,
    });
  }

  // Create storage map only if no existing storage map is provided
  if (!existingStorageMap) {
    planStorageMap = await createStorageMap({
      mappings: newStorageMap,
      name: storageMapName,
      planProject,
      sourceProvider,
      targetProvider,
    });
  }

  // Create plan with references to created maps
  const createdPlanRef = await createPlan({
    networkMap: planNetworkMap,
    planName,
    planProject,
    sourceProvider,
    storageMap: planStorageMap,
    targetProvider,
    vms: Object.values(vms),
  });

  // Add owner references to link resources
  await addOwnerRef(StorageMapModel, planStorageMap, [createdPlanRef]);
  await addOwnerRef(NetworkMapModel, planNetworkMap, [createdPlanRef]);
};
