import { createStorageMap } from 'src/storageMaps/create/utils/createStorageMap';

import type { IoK8sApiCoreV1Secret, V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';
import { CreationMethod, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { isEmpty } from '@utils/helpers';

import { MigrationHookFieldId } from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { addPlanResourceOwnerRefs } from './addPlanResourceOwnerRefs';
import { copyNetworkMap } from './copyNetworkMap';
import { copyStorageMap } from './copyStorageMap';
import { createDecryptionSecret } from './createDecryptionSecret';
import { type CreatedHooks, createMigrationHooks } from './createMigrationHooks';
import { createNetworkMap } from './createNetworkMap';
import { createPlan } from './createPlan';

/**
 * Handles the migration plan submission process including creation of network map,
 * storage map, encryption secret, hooks, and establishing owner references.
 */
export const submitMigrationPlan = async (
  formData: CreatePlanFormData,
  trackEvent?: (eventType: string, properties?: Record<string, unknown>) => void,
): Promise<void> => {
  const {
    diskDecryptionPassPhrases,
    existingNetworkMap,
    existingStorageMap,
    migrateSharedDisks,
    migrationType,
    nbdeClevis,
    networkMap: newNetworkMap,
    networkMapName,
    planName,
    planProject,
    postMigrationHook,
    preMigrationHook,
    preserveStaticIps,
    rootDevice,
    sourceProvider,
    storageMap: newStorageMap,
    storageMapName,
    targetPowerState,
    targetProject,
    targetProvider,
    transferNetwork,
    vms,
  } = formData;

  const hasEnabledHooks =
    preMigrationHook[MigrationHookFieldId.EnableHook] ||
    postMigrationHook[MigrationHookFieldId.EnableHook];

  // Collection of promises for concurrent plan resource creation with fixed positioning
  const createResourceRequests: [
    Promise<V1beta1NetworkMap>,
    Promise<V1beta1StorageMap>,
    Promise<IoK8sApiCoreV1Secret | undefined>,
    Promise<CreatedHooks>,
  ] = [
    existingNetworkMap
      ? copyNetworkMap(existingNetworkMap, planName, planProject)
      : createNetworkMap({
          mappings: newNetworkMap,
          name: networkMapName,
          project: planProject,
          sourceProvider,
          targetNamespace: targetProject,
          targetProvider,
          trackEvent,
        }),

    existingStorageMap
      ? copyStorageMap(existingStorageMap, planName, planProject)
      : createStorageMap({
          mappings: newStorageMap,
          name: storageMapName,
          project: planProject,
          sourceProvider,
          targetProvider,
          trackEvent,
        }),

    isEmpty(diskDecryptionPassPhrases) ||
    diskDecryptionPassPhrases.every((diskPhrase) => diskPhrase.value === '')
      ? Promise.resolve(undefined)
      : createDecryptionSecret(diskDecryptionPassPhrases, planName, planProject),

    hasEnabledHooks
      ? createMigrationHooks({
          planName,
          planProject,
          postMigrationHook,
          preMigrationHook,
        })
      : Promise.resolve({}),
  ];

  // Execute all prerequisite resource creation concurrently
  const [planNetworkMap, planStorageMap, createdSecret, createdHooks] =
    await Promise.all(createResourceRequests);

  // Create the migration plan
  const createdPlanRef = await createPlan({
    luks: createdSecret ? { name: createdSecret.metadata?.name } : undefined,
    migrateSharedDisks,
    migrationType,
    nbdeClevis,
    networkMap: planNetworkMap,
    planName,
    planProject,
    postHook: createdHooks.postHook,
    preHook: createdHooks.preHook,
    preserveStaticIps,
    rootDevice,
    sourceProvider,
    storageMap: planStorageMap,
    targetPowerState: targetPowerState.value,
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

  trackEvent?.(TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED, {
    creationMethod: CreationMethod.PlanWizard,
    hasCustomNetworkMap: !existingNetworkMap,
    hasCustomStorageMap: !existingStorageMap,
    hasEncryption: Boolean(createdSecret),
    hasHooks: hasEnabledHooks,
    migrationType,
    planNamespace: planProject,
    sourceProviderType: sourceProvider?.spec?.type,
    targetNamespace: targetProject,
    targetProviderType: targetProvider?.spec?.type,
    vmCount: Object.keys(vms).length,
  });
};
