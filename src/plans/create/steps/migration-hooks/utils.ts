import { validateContainerImage, validateK8sName } from 'src/providers/utils/validators/common';

import { t } from '@utils/i18n';

import { HooksFormFieldId, MigrationHookFieldId } from './constants';

export const getHooksSubFieldId = <T extends MigrationHookFieldId>(
  fieldId: HooksFormFieldId,
  subFieldId: T,
): `${HooksFormFieldId}.${T}` => `${fieldId}.${subFieldId}`;

export const getEnableHookFieldLabel = (fieldId: HooksFormFieldId) =>
  `Enable ${fieldId === HooksFormFieldId.PreMigration ? 'pre' : 'post'} migration hook`;

export const hooksFormFieldLabels: Partial<Record<MigrationHookFieldId, ReturnType<typeof t>>> = {
  [MigrationHookFieldId.AnsiblePlaybook]: t('Ansible playbook'),
  [MigrationHookFieldId.HookRunnerImage]: t('Hook runner image'),
  [MigrationHookFieldId.ServiceAccount]: t('Service account'),
};

/**
 * Validates a hook runner image field value.
 * Ensures the image is not empty and follows valid container image format.
 */
export const validateHookRunnerImage = (value: string): string | undefined => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return t('Hook runner image is required.');
  }

  if (!validateContainerImage(trimmedValue)) {
    return t(
      'Invalid container image format. Expected format: <registry_route_or_server_path>/image:<tag>',
    );
  }

  return undefined;
};

export const validateHookServiceAccount = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (!validateK8sName(value)) {
    return t(
      "Service account name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
    );
  }

  return undefined;
};
