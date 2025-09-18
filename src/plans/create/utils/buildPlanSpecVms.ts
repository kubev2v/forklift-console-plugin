import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  ProviderVirtualMachine,
  V1beta1Hook,
  V1beta1PlanSpecVms,
  V1beta1PlanSpecVmsHooks,
  V1beta1PlanSpecVmsLuks,
} from '@kubev2v/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

type PlanSpecVmsParams = {
  vms: ProviderVirtualMachine[];
  preHook?: V1beta1Hook;
  postHook?: V1beta1Hook;
  luks?: V1beta1PlanSpecVmsLuks;
  rootDevice?: string;
  nbdeClevis?: boolean;
};

/**
 * Builds an array of V1beta1PlanSpecVms for inclusion in a Plan spec.
 * Adds pre/post hooks, root disk info, LUKS config, and namespace (if OpenShift).
 */
export const buildPlanSpecVms = ({
  luks,
  nbdeClevis,
  postHook,
  preHook,
  rootDevice,
  vms,
}: PlanSpecVmsParams): V1beta1PlanSpecVms[] =>
  vms.map((vm) => {
    const hooks: V1beta1PlanSpecVmsHooks[] = [];
    const preHookName = getName(preHook);
    const preHookNamespace = getNamespace(preHook);

    if (preHookName && preHookNamespace) {
      hooks.push({
        hook: {
          name: preHookName,
          namespace: preHookNamespace,
        },
        step: 'PreHook',
      });
    }

    const postHookName = getName(postHook);
    const postHookNamespace = getNamespace(postHook);

    if (postHookName && postHookNamespace) {
      hooks.push({
        hook: {
          name: postHookName,
          namespace: postHookNamespace,
        },
        step: 'PostHook',
      });
    }

    return {
      id: vm.id,
      name: vm.name,
      ...(vm.providerType === PROVIDER_TYPES.openshift && { namespace: vm.namespace }),
      ...(rootDevice && { rootDisk: rootDevice }),
      ...(luks && { luks }),
      ...(nbdeClevis && { nbdeClevis }),
      ...(!isEmpty(hooks) && { hooks }),
    };
  });
