export const hookType = {
  PostHook: 'PostHook',
  PreHook: 'PreHook',
} as const;

export type HookType = (typeof hookType)[keyof typeof hookType];

export const HookTypeLabel = {
  [hookType.PostHook]: 'Post',
  [hookType.PreHook]: 'Pre',
};

export const HookTypeLabelLowercase = {
  [hookType.PostHook]: 'post',
  [hookType.PreHook]: 'pre',
};
