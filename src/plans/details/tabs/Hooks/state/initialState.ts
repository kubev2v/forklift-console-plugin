import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';

import { type HookType, hookType, HookTypeLabelLowercase } from '../utils/constants';

import type { FormState } from './types';

const hookTemplate = (plan: V1beta1Plan, step: HookType): V1beta1Hook => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: {
    name: `${getName(plan)}-${HookTypeLabelLowercase[step]}-hook`,
    namespace: getNamespace(plan),
    ownerReferences: [
      {
        apiVersion: plan?.apiVersion,
        kind: plan?.kind,
        name: getName(plan)!,
        uid: getUID(plan)!,
      },
    ],
  },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
});

export const initialState = (
  plan: V1beta1Plan,
  preHookResource: V1beta1Hook | undefined,
  postHookResource: V1beta1Hook | undefined,
): FormState => ({
  alertMessage: undefined,
  hasChanges: false,
  isLoading: false,
  postHook: deepCopy(postHookResource) ?? hookTemplate(plan, hookType.PostHook),
  postHookSet: Boolean(postHookResource),
  preHook: deepCopy(preHookResource) ?? hookTemplate(plan, hookType.PreHook),
  preHookSet: Boolean(preHookResource),
});
