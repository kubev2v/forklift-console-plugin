import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

export type VMData = {
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  pods: IoK8sApiCoreV1Pod[];
  jobs: IoK8sApiBatchV1Job[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  conditions?: V1beta1PlanStatusConditions[];
  targetNamespace: string;
};
