export enum HooksFormFieldId {
  PreMigration = 'preMigrationHook',
  PostMigration = 'postMigrationHook',
}

export enum MigrationHookFieldId {
  EnableHook = 'enableHook',
  HookRunnerImage = 'runnerImage',
  AnsiblePlaybook = 'ansiblePlaybook',
}

export type MigrationHook = {
  [MigrationHookFieldId.EnableHook]: boolean;
  [MigrationHookFieldId.HookRunnerImage]: string;
  [MigrationHookFieldId.AnsiblePlaybook]: string;
};
