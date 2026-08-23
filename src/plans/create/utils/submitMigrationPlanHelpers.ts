import { CreationMethod } from '@utils/analytics/constants';

import { AapFormFieldId, type MigrationHook } from '../steps/migration-hooks/constants';
import type { CreatePlanFormData } from '../types';

import {
  createAapMigrationHooks,
  type CreatedHooks,
  createLocalMigrationHooks,
} from './createMigrationHooks';

type ResolveHooksParams = {
  hasAapHooks: boolean;
  hasLocalHooks: boolean;
  planName: string;
  planProject: string;
  postHookJobTemplateId?: number;
  postHookJobTemplateName?: string;
  postMigrationHook: MigrationHook;
  preHookJobTemplateId?: number;
  preHookJobTemplateName?: string;
  preMigrationHook: MigrationHook;
};

export const resolveHooksCreation = async (params: ResolveHooksParams): Promise<CreatedHooks> => {
  if (params.hasAapHooks) {
    return createAapMigrationHooks({
      planName: params.planName,
      planProject: params.planProject,
      postHookJobTemplateId: params.postHookJobTemplateId,
      postHookJobTemplateName: params.postHookJobTemplateName,
      preHookJobTemplateId: params.preHookJobTemplateId,
      preHookJobTemplateName: params.preHookJobTemplateName,
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

export const buildTelemetryProps = (
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
