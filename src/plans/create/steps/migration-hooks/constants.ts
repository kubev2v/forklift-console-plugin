export const AAP_CONNECTION_STATUS_CONNECTED = 'connected' as const;
export const AAP_CONNECTION_STATUS_CONNECTING = 'connecting' as const;
export const AAP_CONNECTION_STATUS_CONNECTION_FAILED = 'connectionFailed' as const;
export const AAP_CONNECTION_STATUS_IDLE = 'idle' as const;

export type AapConnectionStatus =
  | typeof AAP_CONNECTION_STATUS_CONNECTED
  | typeof AAP_CONNECTION_STATUS_CONNECTING
  | typeof AAP_CONNECTION_STATUS_CONNECTION_FAILED
  | typeof AAP_CONNECTION_STATUS_IDLE;

export const HOOK_SOURCE_NONE = 'none' as const;
export const HOOK_SOURCE_LOCAL = 'local' as const;
export const HOOK_SOURCE_AAP = 'aap' as const;

export type HookSource =
  | typeof HOOK_SOURCE_AAP
  | typeof HOOK_SOURCE_LOCAL
  | typeof HOOK_SOURCE_NONE;

export enum AapFormFieldId {
  AapPostHookJobTemplateId = 'aapPostHookJobTemplateId',
  AapPreHookJobTemplateId = 'aapPreHookJobTemplateId',
  HookSource = 'hookSource',
}

export enum HooksFormFieldId {
  PostMigration = 'postMigrationHook',
  PreMigration = 'preMigrationHook',
}

export enum MigrationHookFieldId {
  AnsiblePlaybook = 'ansiblePlaybook',
  EnableHook = 'enableHook',
  HookRunnerImage = 'runnerImage',
  ServiceAccount = 'serviceAccount',
}

export type MigrationHook = {
  [MigrationHookFieldId.AnsiblePlaybook]?: string;
  [MigrationHookFieldId.EnableHook]: boolean;
  [MigrationHookFieldId.HookRunnerImage]?: string;
  [MigrationHookFieldId.ServiceAccount]?: string;
};
