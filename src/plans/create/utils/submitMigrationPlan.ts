import {
  HookModel,
  type IoK8sApiCoreV1Secret,
  NetworkMapModel,
  SecretModel,
  StorageMapModel,
  type V1beta1Hook,
  type V1beta1NetworkMap,
  type V1beta1StorageMap,
} from '@kubev2v/types';

import { MigrationHookFieldId } from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { addOwnerRefs } from './addOwnerRefs';
import { createDecryptionSecret } from './createDecryptionSecret';
import { createMigrationHooks } from './createMigrationHooks';
import { createNetworkMap } from './createNetworkMap';
import { createPlan } from './createPlan';
import { createStorageMap } from './createStorageMap';

/**
 * Handles the migration plan submission process including creation of network map,
 * storage map, encryption secret, hooks, and establishing owner references.
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
    postMigrationHook,
    preMigrationHook,
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
  let createdSecret: IoK8sApiCoreV1Secret | undefined = {};
  let createdHooks: { preHook?: V1beta1Hook; postHook?: V1beta1Hook } = {};

  // Collection of promises for concurrent resource creation
  const createResourceRequests: Promise<void>[] = [];

  // Create network map
  if (!existingNetworkMap) {
    createResourceRequests.push(
      createNetworkMap({
        mappings: newNetworkMap,
        name: networkMapName,
        planProject,
        sourceProvider,
        targetProvider,
      }).then((networkMap: V1beta1NetworkMap) => {
        planNetworkMap = networkMap;
      }),
    );
  }

  // Create storage map
  if (!existingStorageMap) {
    createResourceRequests.push(
      createStorageMap({
        mappings: newStorageMap,
        name: storageMapName,
        planProject,
        sourceProvider,
        targetProvider,
      }).then((storageMap: V1beta1StorageMap) => {
        planStorageMap = storageMap;
      }),
    );
  }

  // Create decryption secret
  if (diskDecryptionPassPhrases) {
    createResourceRequests.push(
      createDecryptionSecret(diskDecryptionPassPhrases, planName, planProject).then(
        (secret: IoK8sApiCoreV1Secret) => {
          createdSecret = secret;
        },
      ),
    );
  }

  // Create migration hooks
  const hasEnabledHooks =
    preMigrationHook[MigrationHookFieldId.EnableHook] ||
    postMigrationHook[MigrationHookFieldId.EnableHook];

  if (hasEnabledHooks) {
    createResourceRequests.push(
      createMigrationHooks({
        planName,
        planProject,
        postMigrationHook,
        preMigrationHook,
      }).then((hooks) => {
        createdHooks = hooks;
      }),
    );
  }

  // Execute all prerequisite resource creation concurrently
  await Promise.all(createResourceRequests);

  // Create the migration plan
  const createdPlanRef = await createPlan({
    luks: createdSecret ? { name: createdSecret.metadata?.name } : undefined,
    migrationType,
    networkMap: planNetworkMap,
    planName,
    planProject,
    postHook: createdHooks.postHook,
    preHook: createdHooks.preHook,
    preserveStaticIps,
    rootDevice,
    sharedDisks,
    sourceProvider,
    storageMap: planStorageMap,
    targetProvider,
    transferNetwork,
    vms: Object.values(vms),
  });

  // Establish owner references for resources to the created plan
  const addOwnerRefRequests: ReturnType<typeof addOwnerRefs>[] = [
    addOwnerRefs(StorageMapModel, planStorageMap, [createdPlanRef]),
    addOwnerRefs(NetworkMapModel, planNetworkMap, [createdPlanRef]),
  ];

  if (createdSecret) {
    addOwnerRefRequests.push(addOwnerRefs(SecretModel, createdSecret, [createdPlanRef]));
  }

  if (createdHooks.preHook) {
    addOwnerRefRequests.push(addOwnerRefs(HookModel, createdHooks.preHook, [createdPlanRef]));
  }

  if (createdHooks.postHook) {
    addOwnerRefRequests.push(addOwnerRefs(HookModel, createdHooks.postHook, [createdPlanRef]));
  }

  await Promise.all(addOwnerRefRequests);
};
