import type {
  IoK8sApiCoreV1Secret,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@kubev2v/types';

import { MigrationHookFieldId } from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { addPlanResourceOwnerRefs } from './addPlanResourceOwnerRefs';
import { copyNetworkMap } from './copyNetworkMap';
import { copyStorageMap } from './copyStorageMap';
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
    targetProject,
    targetProvider,
    transferNetwork,
    vms,
  } = formData;

  let planNetworkMap = {} as V1beta1NetworkMap;
  let planStorageMap = {} as V1beta1StorageMap;
  let createdSecret: IoK8sApiCoreV1Secret | undefined = {};
  let createdHooks: { preHook?: V1beta1Hook; postHook?: V1beta1Hook } = {};

  // Collection of promises for concurrent plan resource creation
  const createResourceRequests: Promise<void>[] = [];

  // Create or copy network map
  if (existingNetworkMap) {
    createResourceRequests.push(
      copyNetworkMap(existingNetworkMap, planName, planProject).then(
        (networkMap: V1beta1NetworkMap) => {
          planNetworkMap = networkMap;
        },
      ),
    );
  } else {
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

  // Create or copy storage map
  if (existingStorageMap) {
    createResourceRequests.push(
      copyStorageMap(existingStorageMap, planName, planProject).then(
        (storageMap: V1beta1StorageMap) => {
          planStorageMap = storageMap;
        },
      ),
    );
  } else {
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
    targetProject,
    targetProvider,
    transferNetwork,
    vms: Object.values(vms),
  });

  // Add owner references to all created resources
  await addPlanResourceOwnerRefs(
    {
      hooks: createdHooks,
      networkMap: planNetworkMap,
      secret: createdSecret,
      storageMap: planStorageMap,
    },
    createdPlanRef,
  );
};
