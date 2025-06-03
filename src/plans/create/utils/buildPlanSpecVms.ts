import type {
  ProviderVirtualMachine,
  V1beta1Hook,
  V1beta1PlanSpecVms,
  V1beta1PlanSpecVmsHooks,
  V1beta1PlanSpecVmsLuks,
} from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { ProviderType } from '../types';

type PlanSpecVmsParams = {
  vms: ProviderVirtualMachine[];
  preHook?: V1beta1Hook;
  postHook?: V1beta1Hook;
  luks?: V1beta1PlanSpecVmsLuks;
  rootDevice?: string;
};

/**
 * Builds an array of V1beta1PlanSpecVms for inclusion in a Plan spec.
 * Adds pre/post hooks, root disk info, LUKS config, and namespace (if OpenShift).
 */
export const buildPlanSpecVms = ({
  luks,
  postHook,
  preHook,
  rootDevice,
  vms,
}: PlanSpecVmsParams): V1beta1PlanSpecVms[] =>
  vms.map((vm) => {
    const hooks: V1beta1PlanSpecVmsHooks[] = [];

    if (preHook?.metadata?.name && preHook.metadata.namespace) {
      hooks.push({
        hook: {
          name: preHook.metadata.name,
          namespace: preHook.metadata.namespace,
        },
        step: 'PreHook',
      });
    }

    if (postHook?.metadata?.name && postHook.metadata.namespace) {
      hooks.push({
        hook: {
          name: postHook.metadata.name,
          namespace: postHook.metadata.namespace,
        },
        step: 'PostHook',
      });
    }

    return {
      id: vm.id,
      name: vm.name,
      ...(vm.providerType === ProviderType.Openshift && { namespace: vm.namespace }),
      ...(rootDevice && { rootDisk: rootDevice }),
      ...(luks && { luks }),
      ...(!isEmpty(hooks) && { hooks }),
    };
  });
