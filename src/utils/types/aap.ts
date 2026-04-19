/**
 * Local AAP types until @forklift-ui/types is updated with the merged Hook CRD changes.
 * These mirror the Go types from pkg/apis/forklift/v1beta1/hook.go in the forklift repo.
 */

export type AAPTokenSecretRef = {
  apiVersion?: string;
  fieldPath?: string;
  kind?: string;
  name: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
};

export type AAPConfig = {
  jobTemplateId: number;
  timeout?: number;
  tokenSecret: AAPTokenSecretRef;
  url: string;
};

export type AapJobTemplate = {
  description: string;
  id: number;
  name: string;
};

export type AapJobTemplatesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AapJobTemplate[];
};
