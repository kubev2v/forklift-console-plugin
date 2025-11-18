export const hookTypes = {
  PostHook: 'PostHook',
  PreHook: 'PreHook',
} as const;

export type HookType = (typeof hookTypes)[keyof typeof hookTypes];

export const HookTypeLabelLowercase = {
  [hookTypes.PostHook]: 'post',
  [hookTypes.PreHook]: 'pre',
};

export const QUAY_FORKLIFT_HOOK_RUNNER_IMAGE = 'quay.io/konveyor/hook-runner';
