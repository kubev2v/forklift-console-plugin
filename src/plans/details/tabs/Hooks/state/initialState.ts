import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
  type HookSource,
} from 'src/plans/create/steps/migration-hooks/constants';

import type { V1beta1Hook } from '@forklift-ui/types';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

import { QUAY_FORKLIFT_HOOK_RUNNER_IMAGE } from '../utils/constants';
import { getAapConfig } from '../utils/utils';

import type { HookEditFormValues } from './types';

export const getDefaultHookValues = (hook: V1beta1Hook | undefined): HookEditFormValues => {
  const aap = getAapConfig(hook);

  let hookSource = HOOK_SOURCE_NONE as HookSource;
  if (aap) {
    hookSource = HOOK_SOURCE_AAP;
  } else if (hook) {
    hookSource = HOOK_SOURCE_LOCAL;
  }

  return {
    aapJobTemplateId: aap?.jobTemplateId,
    aapJobTemplateName: hook?.metadata?.annotations?.[ANNOTATION_AAP_JOB_TEMPLATE_NAME],
    hookSource,
    image: hook?.spec?.image ?? QUAY_FORKLIFT_HOOK_RUNNER_IMAGE,
    playbook: hook?.spec?.playbook ?? '',
    serviceAccount: hook?.spec?.serviceAccount ?? '',
  };
};
