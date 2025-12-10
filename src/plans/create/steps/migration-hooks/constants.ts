export enum HooksFormFieldId {
  PreMigration = 'preMigrationHook',
  PostMigration = 'postMigrationHook',
}

export enum MigrationHookFieldId {
  EnableHook = 'enableHook',
  HookRunnerImage = 'runnerImage',
  AnsiblePlaybook = 'ansiblePlaybook',
  ServiceAccount = 'serviceAccount',
}

export type MigrationHook = {
  [MigrationHookFieldId.EnableHook]: boolean;
  [MigrationHookFieldId.HookRunnerImage]?: string;
  [MigrationHookFieldId.AnsiblePlaybook]?: string;
  [MigrationHookFieldId.ServiceAccount]?: string;
};
