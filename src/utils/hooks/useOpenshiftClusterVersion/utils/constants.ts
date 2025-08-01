import type { K8sModel, K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export type ClusterVersion = K8sResourceKind & {
  status: {
    desired: {
      version: string;
    };
  };
};

export const ClusterVersionModel: K8sModel = {
  abbr: 'CV',
  apiGroup: 'config.openshift.io',
  apiVersion: 'v1',
  crd: true,
  id: 'clusterversion',
  kind: 'ClusterVersion',
  label: 'ClusterVersion',
  labelKey: 'ClusterVersion',
  labelPlural: 'ClusterVersions',
  labelPluralKey: 'ClusterVersions',
  namespaced: false,
  plural: 'clusterversions',
};
