export const ANNOTATION_AAP_JOB_TEMPLATE_NAME = 'forklift.konveyor.io/aap-job-template-name';

export type AapJobTemplate = {
  description: string;
  id: number;
  name: string;
};

export type AapJobTemplatesResponse = {
  count: number;
  results: AapJobTemplate[];
};
