import { HookModel, type V1beta1Hook } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { type MigrationHook, MigrationHookFieldId } from '../steps/migration-hooks/constants';

type CreatedHooks = {
  preHook?: V1beta1Hook;
  postHook?: V1beta1Hook;
};

type HookParams = {
  hookType: 'pre' | 'post';
  hookConfig: MigrationHook;
  planName: string;
  planProject: string;
};

type CreateHooksParams = {
  preMigrationHook: MigrationHook;
  postMigrationHook: MigrationHook;
  planName: string;
  planProject: string;
};

/**
 * Creates a migration hook with the specified configuration
 */
const createHook = async (params: HookParams): Promise<V1beta1Hook> => {
  const { hookConfig, hookType, planName, planProject } = params;

  const hook: V1beta1Hook = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Hook',
    metadata: {
      name: `${planName}-${hookType}-hook`,
      namespace: planProject,
    },
    spec: {
      image: hookConfig[MigrationHookFieldId.HookRunnerImage] ?? '',
      playbook: hookConfig[MigrationHookFieldId.AnsiblePlaybook] ?? '',
    },
  };

  return k8sCreate({ data: hook, model: HookModel });
};

/**
 * Creates pre and post migration hooks based on form configuration
 */
export const createMigrationHooks = async (params: CreateHooksParams): Promise<CreatedHooks> => {
  const { planName, planProject, postMigrationHook, preMigrationHook } = params;
  const hooks: CreatedHooks = {};

  if (preMigrationHook[MigrationHookFieldId.EnableHook]) {
    hooks.preHook = await createHook({
      hookConfig: preMigrationHook,
      hookType: 'pre',
      planName,
      planProject,
    });
  }

  if (postMigrationHook[MigrationHookFieldId.EnableHook]) {
    hooks.postHook = await createHook({
      hookConfig: postMigrationHook,
      hookType: 'post',
      planName,
      planProject,
    });
  }

  return hooks;
};
