import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import type { TargetStorage } from '@utils/storage/types';

import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  MigrationHookFieldId,
} from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { addPlanResourceOwnerRefs } from './addPlanResourceOwnerRefs';
import { buildMigrationPlanResourceRequests } from './buildMigrationPlanResourceRequests';
import { createPlan } from './createPlan';
import { buildTelemetryProps } from './submitMigrationPlanHelpers';

/**
 * Handles the migration plan submission process including creation of network map,
 * storage map, encryption secret, hooks, and establishing owner references.
 */
export const submitMigrationPlan = async (
  formData: CreatePlanFormData,
  trackEvent?: (eventType: string, properties?: Record<string, unknown>) => void,
  targetStorages?: TargetStorage[],
): Promise<void> => {
  const {
    instanceTypes,
    migrateSharedDisks,
    migrationType,
    nbdeClevis,
    planDescription,
    planName,
    planProject,
    postMigrationHook,
    preMigrationHook,
    preserveStaticIps,
    rootDevice,
    sourceProvider,
    targetPowerState,
    targetProject,
    targetProvider,
    transferNetwork,
    vms,
  } = formData;

  const hookSource = formData[AapFormFieldId.HookSource];

  const hasLocalHooks =
    hookSource === HOOK_SOURCE_LOCAL &&
    (preMigrationHook[MigrationHookFieldId.EnableHook] ||
      postMigrationHook[MigrationHookFieldId.EnableHook]);

  const aapPreHookJobTemplateId = formData[AapFormFieldId.AapPreHookJobTemplateId];
  const aapPostHookJobTemplateId = formData[AapFormFieldId.AapPostHookJobTemplateId];

  const hasAapHooks =
    hookSource === HOOK_SOURCE_AAP &&
    (aapPreHookJobTemplateId !== undefined || aapPostHookJobTemplateId !== undefined);

  const hasEnabledHooks = hasLocalHooks || hasAapHooks;

  const [planNetworkMap, planStorageMap, decryptionResult, createdHooks, scriptsConfigMap] =
    await Promise.all(
      buildMigrationPlanResourceRequests({
        formData,
        hasAapHooks,
        hasLocalHooks,
        targetStorages,
        trackEvent,
      }),
    );

  const createdPlanRef = await createPlan({
    customScriptsConfigMap: scriptsConfigMap,
    instanceTypes,
    luks: decryptionResult.secret ? { name: decryptionResult.secret.metadata?.name } : undefined,
    migrateSharedDisks,
    migrationType,
    nbdeClevis,
    networkMap: planNetworkMap,
    planDescription,
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

  await addPlanResourceOwnerRefs(
    {
      hooks: createdHooks,
      networkMap: planNetworkMap,
      scriptsConfigMap,
      secret: decryptionResult.secret,
      storageMap: planStorageMap,
    },
    createdPlanRef,
  );

  trackEvent?.(
    TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
    buildTelemetryProps(formData, hasEnabledHooks),
  );
};
