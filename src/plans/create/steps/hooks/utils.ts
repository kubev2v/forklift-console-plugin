import { t } from '@utils/i18n';

import { HooksFormFieldId, MigrationHookFieldId } from './constants';

type HooksSubFieldId = `${HooksFormFieldId}.${MigrationHookFieldId}`;

export const getHooksSubFieldId = (
  fieldId: HooksFormFieldId,
  subFieldId: MigrationHookFieldId,
): HooksSubFieldId => `${fieldId}.${subFieldId}`;

export const getHooksFormFieldLabels = (
  fieldId: HooksFormFieldId,
): Partial<Record<MigrationHookFieldId, ReturnType<typeof t>>> => ({
  [MigrationHookFieldId.AnsiblePlaybook]: t('Ansible playbook'),
  [MigrationHookFieldId.EnableHook]: t(
    `Enable ${fieldId === HooksFormFieldId.PreMigration ? 'pre' : 'post'} migration hook`,
  ),
  [MigrationHookFieldId.HookRunnerImage]: t('Hook runner image'),
});
