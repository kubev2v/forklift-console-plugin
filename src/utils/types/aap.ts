/**
 * Local AAP types until @forklift-ui/types is updated with the merged Hook CRD.
 *
 * spec.aap contains jobTemplateId (required) plus optional per-hook overrides (url, tokenSecret, timeout).
 * The human-readable job template name is stored as metadata annotation:
 *   forklift.konveyor.io/aap-job-template-name
 *
 * Centralized connection config (URL, token, timeout) lives on the ForkliftController CR.
 */

export const ANNOTATION_AAP_JOB_TEMPLATE_NAME = 'forklift.konveyor.io/aap-job-template-name';

export type AAPConfig = {
  jobTemplateId: number;
  timeout?: number;
  tokenSecret?: { name: string; namespace?: string };
  url?: string;
};

export type AapJobTemplate = {
  description: string;
  id: number;
  name: string;
};

export type AapJobTemplatesResponse = {
  count: number;
  results: AapJobTemplate[];
};
