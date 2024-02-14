import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../generated';

export interface K8sResourceCommon {
  apiVersion?: string;
  kind?: string;
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
}
