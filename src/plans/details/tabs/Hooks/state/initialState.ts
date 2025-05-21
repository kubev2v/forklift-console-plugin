import type { V1beta1Hook } from '@kubev2v/types';

import { QUAY_FORKLIFT_HOOK_RUNNER_IMAGE } from '../utils/constants';

import type { HookFormValues } from './types';

export const getDefaultValues = (
  postHookResource: V1beta1Hook | undefined,
  preHookResource: V1beta1Hook | undefined,
): HookFormValues => ({
  postHookImage: postHookResource?.spec?.image ?? QUAY_FORKLIFT_HOOK_RUNNER_IMAGE,
  postHookPlaybook: postHookResource?.spec?.playbook ?? '',
  postHookSet: Boolean(postHookResource),
  preHookImage: preHookResource?.spec?.image ?? QUAY_FORKLIFT_HOOK_RUNNER_IMAGE,
  preHookPlaybook: preHookResource?.spec?.playbook ?? '',
  preHookSet: Boolean(preHookResource),
});
