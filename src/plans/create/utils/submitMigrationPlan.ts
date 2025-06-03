import {
  type IoK8sApiCoreV1Secret,
  NetworkMapModel,
  SecretModel,
  StorageMapModel,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import type { CreatePlanFormData } from '../types';

import { addOwnerRefs } from './addOwnerRefs';
import { createNetworkMap } from './createNetworkMap';
import { createPlan } from './createPlan';
import { createStorageMap } from './createStorageMap';

/**
 * Handles the plan submission process including creation of network map, storage map,
 * plan, and establishing owner references.
 */
export const submitMigrationPlan = async (formData: CreatePlanFormData): Promise<void> => {
  const {
    diskDecryptionPassPhrases,
    existingNetworkMap,
    existingStorageMap,
    migrationType,
    networkMap: newNetworkMap,
    networkMapName,
    planName,
    planProject,
    preserveStaticIps,
    rootDevice,
    sharedDisks,
    sourceProvider,
    storageMap: newStorageMap,
    storageMapName,
    targetProvider,
    transferNetwork,
    vms,
  } = formData;

  let planNetworkMap = existingNetworkMap!;
  let planStorageMap = existingStorageMap!;
  let createdSecret: IoK8sApiCoreV1Secret = {};

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

  if (diskDecryptionPassPhrases) {
    const secretData: IoK8sApiCoreV1Secret = {
      data: Object.fromEntries(diskDecryptionPassPhrases.map(({ value }, i) => [i, btoa(value)])),
      metadata: {
        generateName: `${planName}-`,
        namespace: planProject,
      },
      type: 'Opaque',
    };

    createdSecret = await k8sCreate({ data: secretData, model: SecretModel });
  }

  // Create plan with references to created maps
  const createdPlanRef = await createPlan({
    luks: { name: createdSecret.metadata?.name },
    migrationType,
    networkMap: planNetworkMap,
    planName,
    planProject,
    preserveStaticIps,
    rootDevice,
    sharedDisks,
    sourceProvider,
    storageMap: planStorageMap,
    targetProvider,
    transferNetwork,
    vms: Object.values(vms),
  });

  // Add owner references to link resources
  await addOwnerRefs(StorageMapModel, planStorageMap, [createdPlanRef]);
  await addOwnerRefs(NetworkMapModel, planNetworkMap, [createdPlanRef]);
  await addOwnerRefs(SecretModel, createdSecret, [createdPlanRef]);
};
