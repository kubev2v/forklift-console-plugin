import { t } from '@utils/i18n';

import { HooksFormFieldId, MigrationHookFieldId } from './constants';

type HooksSubFieldId = `${HooksFormFieldId}.${MigrationHookFieldId}`;

export const getHooksSubFieldId = (
  fieldId: HooksFormFieldId,
  subFieldId: MigrationHookFieldId,
): HooksSubFieldId => `${fieldId}.${subFieldId}`;

export const getEnableHookFieldLabel = (fieldId: HooksFormFieldId) =>
  `Enable ${fieldId === HooksFormFieldId.PreMigration ? 'pre' : 'post'} migration hook`;

export const hooksFormFieldLabels: Partial<Record<MigrationHookFieldId, ReturnType<typeof t>>> = {
  [MigrationHookFieldId.AnsiblePlaybook]: t('Ansible playbook'),
  [MigrationHookFieldId.HookRunnerImage]: t('Hook runner image'),
};
