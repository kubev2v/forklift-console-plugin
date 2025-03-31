import { deepCopy } from 'src/utils';

import type { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';

import type { FormState } from './reducer';

const preHookTemplate = (plan: V1beta1Plan) => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: {
    name: `${plan?.metadata?.name}-pre-hook`,
    namespace: plan?.metadata?.namespace,
    ownerReferences: [
      {
        apiVersion: plan?.apiVersion,
        kind: plan?.kind,
        name: plan?.metadata?.name,
        uid: plan?.metadata?.uid,
      },
    ],
  },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
});

const postHookTemplate = (plan: V1beta1Plan) => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: {
    name: `${plan?.metadata?.name}-post-hook`,
    namespace: plan?.metadata?.namespace,
    ownerReferences: [
      {
        apiVersion: plan?.apiVersion,
        kind: plan?.kind,
        name: plan?.metadata?.name,
        uid: plan?.metadata?.uid,
      },
    ],
  },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
});

export const initialState = (
  plan: V1beta1Plan,
  preHookResource: V1beta1Hook,
  postHookResource: V1beta1Hook,
): FormState => ({
  alertMessage: undefined,
  hasChanges: false,
  isLoading: false,
  postHook: deepCopy(postHookResource) || postHookTemplate(plan),
  postHookSet: Boolean(postHookResource),
  preHook: deepCopy(preHookResource) || preHookTemplate(plan),
  preHookSet: Boolean(preHookResource),
});
