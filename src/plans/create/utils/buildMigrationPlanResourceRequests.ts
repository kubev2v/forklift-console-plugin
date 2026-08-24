import { createStorageMap } from 'src/storageMaps/create/utils/createStorageMap';

import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import type { TargetStorage } from '@utils/storage/types';

import { AapFormFieldId } from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import { copyNetworkMap } from './copyNetworkMap';
import { copyStorageMap } from './copyStorageMap';
import { createNetworkMap } from './createNetworkMap';
import { resolveDecryptionSecret } from './resolveDecryptionSecret';
import { resolveScriptsConfigMap } from './resolveScriptsConfigMap';
import { resolveHooksCreation } from './submitMigrationPlanHelpers';

type MigrationPlanResourceRequests = [
  Promise<V1beta1NetworkMap>,
  Promise<V1beta1StorageMap>,
  ReturnType<typeof resolveDecryptionSecret>,
  ReturnType<typeof resolveHooksCreation>,
  Promise<IoK8sApiCoreV1ConfigMap | undefined>,
];

type BuildResourceRequestsParams = {
  formData: CreatePlanFormData;
  hasAapHooks: boolean;
  hasLocalHooks: boolean;
  targetStorages?: TargetStorage[];
  trackEvent?: (eventType: string, properties?: Record<string, unknown>) => void;
};

export const buildMigrationPlanResourceRequests = ({
  formData,
  hasAapHooks,
  hasLocalHooks,
  targetStorages,
  trackEvent,
}: BuildResourceRequestsParams): MigrationPlanResourceRequests => {
  const {
    customScripts,
    customScriptsType,
    diskDecryptionPassPhrases,
    diskDecryptionType,
    existingCustomScriptsConfigMap,
    existingLUKSSecret,
    existingNetworkMap,
    existingStorageMap,
    networkMap: newNetworkMap,
    networkMapName,
    planName,
    planProject,
    postMigrationHook,
    preMigrationHook,
    sourceProvider,
    storageMap: newStorageMap,
    storageMapName,
    targetProject,
    targetProvider,
  } = formData;

  const aapPreHookJobTemplateId = formData[AapFormFieldId.AapPreHookJobTemplateId];
  const aapPreHookJobTemplateName = formData[AapFormFieldId.AapPreHookJobTemplateName];
  const aapPostHookJobTemplateId = formData[AapFormFieldId.AapPostHookJobTemplateId];
  const aapPostHookJobTemplateName = formData[AapFormFieldId.AapPostHookJobTemplateName];

  return [
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

    resolveDecryptionSecret({
      diskDecryptionPassPhrases,
      diskDecryptionType,
      existingLUKSSecret,
      planName,
      planProject,
    }),

    resolveHooksCreation({
      hasAapHooks,
      hasLocalHooks,
      planName,
      planProject,
      postHookJobTemplateId: aapPostHookJobTemplateId,
      postHookJobTemplateName: aapPostHookJobTemplateName,
      postMigrationHook,
      preHookJobTemplateId: aapPreHookJobTemplateId,
      preHookJobTemplateName: aapPreHookJobTemplateName,
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
};
