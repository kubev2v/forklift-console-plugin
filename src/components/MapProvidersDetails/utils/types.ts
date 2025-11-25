import type { V1beta1NetworkMap, V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export enum MapProviderEditFormFields {
  Source = 'source',
  Destination = 'destination',
}

export type MapProvidersEditFormValues = {
  [MapProviderEditFormFields.Source]: V1beta1Provider;
  [MapProviderEditFormFields.Destination]: V1beta1Provider;
};

export type MapProvidersEditProps = {
  obj: V1beta1NetworkMap | V1beta1StorageMap;
  model: K8sModel;
  namespace: string;
  sourceProvider: V1beta1Provider;
  destinationProvider: V1beta1Provider;
};
