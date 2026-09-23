import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const VirtualizationValidationModelGroupVersionKind = {
  group: 'forklift.konveyor.io',
  kind: 'VirtualizationValidation',
  version: 'v1beta1',
};

export const VirtualizationValidationModel: K8sModel = {
  abbr: 'VV',
  apiGroup: 'forklift.konveyor.io',
  apiVersion: 'v1beta1',
  kind: 'VirtualizationValidation',
  label: 'Virtualization validation',
  labelPlural: 'Virtualization validations',
  namespaced: true,
  plural: 'virtualizationvalidations',
};
