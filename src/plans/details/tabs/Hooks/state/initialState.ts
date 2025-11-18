import type { V1beta1Hook } from '@kubev2v/types';

import { QUAY_FORKLIFT_HOOK_RUNNER_IMAGE } from '../utils/constants';

import type { HookEditFormValues } from './types';

export const getDefaultHookValues = (hook: V1beta1Hook | undefined): HookEditFormValues => ({
  enabled: Boolean(hook),
  image: hook?.spec?.image ?? QUAY_FORKLIFT_HOOK_RUNNER_IMAGE,
  playbook: hook?.spec?.playbook ?? '',
});
