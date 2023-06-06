import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

export interface Namespace {
  kind: 'Namespace';
  apiVersion: string;

  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
}

export type V1Namespace = Namespace;
