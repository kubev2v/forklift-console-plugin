import { HookModel, type V1beta1Hook } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { type MigrationHook, MigrationHookFieldId } from '../steps/migration-hooks/constants';

export type CreatedHooks = {
  preHook?: V1beta1Hook;
  postHook?: V1beta1Hook;
};

type LocalHookParams = {
  hookConfig: MigrationHook;
  hookType: 'pre' | 'post';
  planName: string;
  planProject: string;
};

type AapHookParams = {
  aapUrl: string;
  hookType: 'pre' | 'post';
  jobTemplateId: number;
  planName: string;
  planProject: string;
  timeout?: number;
  tokenSecretName: string;
};

type CreateLocalHooksParams = {
  planName: string;
  planProject: string;
  postMigrationHook: MigrationHook;
  preMigrationHook: MigrationHook;
};

type CreateAapHooksParams = {
  aapUrl: string;
  planName: string;
  planProject: string;
  postHookJobTemplateId?: number;
  preHookJobTemplateId?: number;
  timeout?: number;
  tokenSecretName: string;
};

const createLocalHook = async (params: LocalHookParams): Promise<V1beta1Hook> => {
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
      serviceAccount: hookConfig[MigrationHookFieldId.ServiceAccount] ?? '',
    },
  };

  return k8sCreate({ data: hook, model: HookModel });
};

const createAapHook = async (params: AapHookParams): Promise<V1beta1Hook> => {
  const { aapUrl, hookType, jobTemplateId, planName, planProject, timeout, tokenSecretName } =
    params;

  const hook = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Hook',
    metadata: {
      name: `${planName}-${hookType}-hook`,
      namespace: planProject,
    },
    spec: {
      aap: {
        jobTemplateId,
        timeout: timeout ?? 0,
        tokenSecret: { name: tokenSecretName, namespace: planProject },
        url: aapUrl,
      },
    },
  };

  return k8sCreate({ data: hook as unknown as V1beta1Hook, model: HookModel });
};

export const createLocalMigrationHooks = async (
  params: CreateLocalHooksParams,
): Promise<CreatedHooks> => {
  const { planName, planProject, postMigrationHook, preMigrationHook } = params;
  const hooks: CreatedHooks = {};

  if (preMigrationHook[MigrationHookFieldId.EnableHook]) {
    hooks.preHook = await createLocalHook({
      hookConfig: preMigrationHook,
      hookType: 'pre',
      planName,
      planProject,
    });
  }

  if (postMigrationHook[MigrationHookFieldId.EnableHook]) {
    hooks.postHook = await createLocalHook({
      hookConfig: postMigrationHook,
      hookType: 'post',
      planName,
      planProject,
    });
  }

  return hooks;
};

export const createAapMigrationHooks = async (
  params: CreateAapHooksParams,
): Promise<CreatedHooks> => {
  const {
    aapUrl,
    planName,
    planProject,
    postHookJobTemplateId,
    preHookJobTemplateId,
    timeout,
    tokenSecretName,
  } = params;
  const hooks: CreatedHooks = {};

  if (preHookJobTemplateId) {
    hooks.preHook = await createAapHook({
      aapUrl,
      hookType: 'pre',
      jobTemplateId: preHookJobTemplateId,
      planName,
      planProject,
      timeout,
      tokenSecretName,
    });
  }

  if (postHookJobTemplateId) {
    hooks.postHook = await createAapHook({
      aapUrl,
      hookType: 'post',
      jobTemplateId: postHookJobTemplateId,
      planName,
      planProject,
      timeout,
      tokenSecretName,
    });
  }

  return hooks;
};
