import type { V1beta1NetworkMap, V1beta1Provider, V1beta1StorageMap } from '@forklift-ui/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export enum MapProviderEditFormFields {
  Source = 'source',
  Destination = 'destination',
}

export type MapProvidersEditFormValues = {
  [MapProviderEditFormFields.Destination]: V1beta1Provider;
  [MapProviderEditFormFields.Source]: V1beta1Provider;
};

export type MapProvidersEditProps = {
  destinationProvider: V1beta1Provider;
  model: K8sModel;
  namespace: string;
  obj: V1beta1NetworkMap | V1beta1StorageMap;
  sourceProvider: V1beta1Provider;
};
