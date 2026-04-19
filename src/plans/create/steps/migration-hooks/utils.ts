import { getInventoryApiUrl } from 'src/providers/utils/helpers/getApiUrl';
import { validateContainerImage, validateK8sName } from 'src/utils/validation/common';

import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';
import type { AapJobTemplatesResponse } from '@utils/types/aap';

import { HooksFormFieldId, MigrationHookFieldId } from './constants';

export const getHooksSubFieldId = <T extends MigrationHookFieldId>(
  fieldId: HooksFormFieldId,
  subFieldId: T,
): `${HooksFormFieldId}.${T}` => `${fieldId}.${subFieldId}`;

export const getEnableHookFieldLabel = (fieldId: HooksFormFieldId): string =>
  `Enable ${fieldId === HooksFormFieldId.PreMigration ? 'pre' : 'post'} migration hook`;

export const hooksFormFieldLabels: Partial<Record<MigrationHookFieldId, ReturnType<typeof t>>> = {
  [MigrationHookFieldId.AnsiblePlaybook]: t('Ansible playbook'),
  [MigrationHookFieldId.HookRunnerImage]: t('Hook runner image'),
  [MigrationHookFieldId.ServiceAccount]: t('Service account'),
};

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

const DEFAULT_MAX_TEMPLATES = 500;

export const fetchAapJobTemplates = async (
  signal?: AbortSignal,
  max = DEFAULT_MAX_TEMPLATES,
): Promise<AapJobTemplatesResponse> =>
  (await consoleFetchJSON(getInventoryApiUrl(`aap/job-templates?max=${String(max)}`), 'GET', {
    signal,
  })) as AapJobTemplatesResponse;
