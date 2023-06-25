import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

export interface K8sResourceCommon {
  apiVersion?: string;
  kind?: string;
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
}
