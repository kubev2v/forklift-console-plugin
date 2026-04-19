import { HookModel, type V1beta1Hook } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

import { type MigrationHook, MigrationHookFieldId } from '../steps/migration-hooks/constants';

export type CreatedHooks = {
  postHook?: V1beta1Hook;
  preHook?: V1beta1Hook;
};

type LocalHookParams = {
  hookConfig: MigrationHook;
  hookType: 'pre' | 'post';
  planName: string;
  planProject: string;
};

type AapHookParams = {
  hookType: 'pre' | 'post';
  jobTemplateId: number;
  jobTemplateName?: string;
  planName: string;
  planProject: string;
};

type CreateLocalHooksParams = {
  planName: string;
  planProject: string;
  postMigrationHook: MigrationHook;
  preMigrationHook: MigrationHook;
};

type CreateAapHooksParams = {
  planName: string;
  planProject: string;
  postHookJobTemplateId?: number;
  postHookJobTemplateName?: string;
  preHookJobTemplateId?: number;
  preHookJobTemplateName?: string;
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
  const { hookType, jobTemplateId, jobTemplateName, planName, planProject } = params;

  const annotations: Record<string, string> = {};
  if (jobTemplateName) {
    annotations[ANNOTATION_AAP_JOB_TEMPLATE_NAME] = jobTemplateName;
  }

  const hook = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Hook',
    metadata: {
      ...(!isEmpty(annotations) && { annotations }),
      name: `${planName}-${hookType}-hook`,
      namespace: planProject,
    },
    spec: {
      aap: { jobTemplateId },
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
    planName,
    planProject,
    postHookJobTemplateId,
    postHookJobTemplateName,
    preHookJobTemplateId,
    preHookJobTemplateName,
  } = params;
  const hooks: CreatedHooks = {};

  if (preHookJobTemplateId) {
    hooks.preHook = await createAapHook({
      hookType: 'pre',
      jobTemplateId: preHookJobTemplateId,
      jobTemplateName: preHookJobTemplateName,
      planName,
      planProject,
    });
  }

  if (postHookJobTemplateId) {
    hooks.postHook = await createAapHook({
      hookType: 'post',
      jobTemplateId: postHookJobTemplateId,
      jobTemplateName: postHookJobTemplateName,
      planName,
      planProject,
    });
  }

  return hooks;
};
