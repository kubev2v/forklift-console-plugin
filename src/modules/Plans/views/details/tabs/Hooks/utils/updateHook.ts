import { HookModel, type V1beta1Hook } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

export const updateHook = async (hook: V1beta1Hook) => {
  await k8sUpdate({ data: hook, model: HookModel });
};
