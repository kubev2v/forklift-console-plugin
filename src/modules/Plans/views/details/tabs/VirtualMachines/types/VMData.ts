import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

import type { PlanData } from './PlanData';

export type VMData = {
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  pods: IoK8sApiCoreV1Pod[];
  jobs: IoK8sApiBatchV1Job[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  dvs: V1beta1DataVolume[];
  conditions?: V1beta1PlanStatusConditions[];
  targetNamespace: string;
  planData?: PlanData;
  vmIndex?: number;
};
