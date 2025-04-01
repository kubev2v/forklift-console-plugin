import { deepCopy } from 'src/utils/deepCopy';

import { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';

import { FormState } from './reducer';

const preHookTemplate = (plan: V1beta1Plan) => ({
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
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
});

const postHookTemplate = (plan: V1beta1Plan) => ({
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
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
});

export const initialState = (
  plan: V1beta1Plan,
  preHookResource: V1beta1Hook,
  postHookResource: V1beta1Hook,
): FormState => ({
  preHookSet: !!preHookResource,
  postHookSet: !!postHookResource,
  preHook: deepCopy(preHookResource) || preHookTemplate(plan),
  postHook: deepCopy(postHookResource) || postHookTemplate(plan),
  hasChanges: false,
  isLoading: false,
  alertMessage: undefined,
});
