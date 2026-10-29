import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const VirtualizationValidationModelGroupVersionKind = {
  group: 'validation.kubevirt.io',
  kind: 'VirtualizationValidation',
  version: 'v1alpha1',
};

export const PROVIDER_NAME_LABEL = 'forklift.konveyor.io/target-provider-name';
export const PROVIDER_UID_LABEL = 'forklift.konveyor.io/target-provider-uid';

export const VirtualizationValidationModel: K8sModel = {
  abbr: 'VCV',
  apiGroup: 'validation.kubevirt.io',
  apiVersion: 'v1alpha1',
  kind: 'VirtualizationValidation',
  label: 'Virtualization validation',
  labelPlural: 'Virtualization validations',
  namespaced: true,
  plural: 'virtualizationvalidations',
};
