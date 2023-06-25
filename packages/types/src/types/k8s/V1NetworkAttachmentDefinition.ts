import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

export interface V1NetworkAttachmentDefinition {
  kind: 'NetworkAttachmentDefinition';
  apiVersion: 'k8s.cni.cncf.io/v1';
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
}
