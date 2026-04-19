import { createStorageMap } from 'src/storageMaps/create/utils/createStorageMap';
import type { TargetStorage } from 'src/storageMaps/utils/types';

import type {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Secret,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { CreationMethod, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { isEmpty } from '@utils/helpers';

import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  type MigrationHook,
  MigrationHookFieldId,
} from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { addPlanResourceOwnerRefs } from './addPlanResourceOwnerRefs';
import { copyNetworkMap } from './copyNetworkMap';
import { copyStorageMap } from './copyStorageMap';
import { createDecryptionSecret } from './createDecryptionSecret';
import {
  createAapMigrationHooks,
  type CreatedHooks,
  createLocalMigrationHooks,
} from './createMigrationHooks';
import { createNetworkMap } from './createNetworkMap';
import { createPlan } from './createPlan';
import { resolveScriptsConfigMap } from './resolveScriptsConfigMap';

type ResolveHooksParams = {
  hasAapHooks: boolean;
  hasLocalHooks: boolean;
  planName: string;
  planProject: string;
  postHookJobTemplateId?: number;
  postMigrationHook: MigrationHook;
  preHookJobTemplateId?: number;
  preMigrationHook: MigrationHook;
};

const resolveHooksCreation = async (params: ResolveHooksParams): Promise<CreatedHooks> => {
  if (params.hasAapHooks) {
    return createAapMigrationHooks({
      planName: params.planName,
      planProject: params.planProject,
      postHookJobTemplateId: params.postHookJobTemplateId,
      preHookJobTemplateId: params.preHookJobTemplateId,
    });
  }

  if (params.hasLocalHooks) {
    return createLocalMigrationHooks({
      planName: params.planName,
      planProject: params.planProject,
      postMigrationHook: params.postMigrationHook,
      preMigrationHook: params.preMigrationHook,
    });
  }

  return Promise.resolve({});
};

const buildTelemetryProps = (
  formData: CreatePlanFormData,
  hasEnabledHooks: boolean,
): Record<string, unknown> => ({
  creationMethod: CreationMethod.PlanWizard,
  hasCustomNetworkMap: !formData.existingNetworkMap,
  hasCustomStorageMap: !formData.existingStorageMap,
  hasEncryption: Boolean(formData.diskDecryptionPassPhrases?.length),
  hasHooks: hasEnabledHooks,
  hookSource: formData[AapFormFieldId.HookSource],
  migrationType: formData.migrationType,
  planNamespace: formData.planProject,
  sourceProviderType: formData.sourceProvider?.spec?.type,
  targetNamespace: formData.targetProject,
  targetProviderType: formData.targetProvider?.spec?.type,
  vmCount: Object.keys(formData.vms ?? {}).length,
});

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
    customScripts,
    customScriptsType,
    diskDecryptionPassPhrases,
    existingCustomScriptsConfigMap,
    existingNetworkMap,
    existingStorageMap,
    instanceTypes,
    migrateSharedDisks,
    migrationType,
    nbdeClevis,
    networkMap: newNetworkMap,
    networkMapName,
    planDescription,
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

  const createResourceRequests: [
    Promise<V1beta1NetworkMap>,
    Promise<V1beta1StorageMap>,
    Promise<IoK8sApiCoreV1Secret | undefined>,
    Promise<CreatedHooks>,
    Promise<IoK8sApiCoreV1ConfigMap | undefined>,
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
          targetStorages,
          trackEvent,
        }),

    isEmpty(diskDecryptionPassPhrases) ||
    diskDecryptionPassPhrases.every((diskPhrase) => diskPhrase.value === '')
      ? Promise.resolve(undefined)
      : createDecryptionSecret(diskDecryptionPassPhrases, planName, planProject),

    resolveHooksCreation({
      hasAapHooks,
      hasLocalHooks,
      planName,
      planProject,
      postHookJobTemplateId: aapPostHookJobTemplateId,
      postMigrationHook,
      preHookJobTemplateId: aapPreHookJobTemplateId,
      preMigrationHook,
    }),

    resolveScriptsConfigMap({
      customScripts,
      customScriptsType,
      existingCustomScriptsConfigMap,
      planName,
      planProject,
    }),
  ];

  const [planNetworkMap, planStorageMap, createdSecret, createdHooks, scriptsConfigMap] =
    await Promise.all(createResourceRequests);

  const createdPlanRef = await createPlan({
    customScriptsConfigMap: scriptsConfigMap,
    instanceTypes,
    luks: createdSecret ? { name: createdSecret.metadata?.name } : undefined,
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
      secret: createdSecret,
      storageMap: planStorageMap,
    },
    createdPlanRef,
  );

  trackEvent?.(
    TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
    buildTelemetryProps(formData, hasEnabledHooks),
  );
};
