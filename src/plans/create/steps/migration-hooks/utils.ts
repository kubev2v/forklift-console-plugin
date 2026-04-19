import { getServicesApiUrl } from 'src/providers/utils/helpers/getApiUrl';
import { validateContainerImage, validateK8sName, validateURL } from 'src/utils/validation/common';

import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';
import type { AapJobTemplatesResponse } from '@utils/types/aap';

import { AAP_URL_PLACEHOLDER, HooksFormFieldId, MigrationHookFieldId } from './constants';

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

export const validateAapUrl = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim() ?? '';

  if (!trimmedValue) {
    return t('AAP URL is required.');
  }

  if (!validateURL(trimmedValue)) {
    return t('Invalid URL format. Expected format: {{example}}', { example: AAP_URL_PLACEHOLDER });
  }

  return undefined;
};

export const validateAapToken = (value: string): string | undefined => {
  if (!value?.trim()) {
    return t('AAP token is required.');
  }

  return undefined;
};

const MIN_JOB_TEMPLATE_ID = 1;

export const validateJobTemplateId = (value: number | undefined): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < MIN_JOB_TEMPLATE_ID) {
    return t('Job template ID must be a positive integer.');
  }

  return undefined;
};

export const fetchAapJobTemplates = async (
  url: string,
  token: string,
  signal?: AbortSignal,
): Promise<AapJobTemplatesResponse> =>
  (await consoleFetchJSON(
    getServicesApiUrl(`aap/job-templates?url=${encodeURIComponent(url)}`),
    'GET',
    { headers: { 'X-AAP-Token': token }, signal },
  )) as AapJobTemplatesResponse;
