import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

interface Secret {
  apiVersion?: string;
  kind?: string;
  immutable?: boolean;
  data?: Record<string, string>;
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  type?: string;
}

export type V1Secret = Secret;
