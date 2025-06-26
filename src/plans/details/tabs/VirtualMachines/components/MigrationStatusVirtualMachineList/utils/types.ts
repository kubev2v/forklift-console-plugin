import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

export type MigrationStatusVirtualMachinePageData = {
  pods: IoK8sApiCoreV1Pod[];
  jobs: IoK8sApiBatchV1Job[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  dvs: V1beta1DataVolume[];
  vmIndex?: number;
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  targetNamespace: string;
  plan: V1beta1Plan;
};

export enum MigrationStatusVirtualMachinesTableResourceId {
  Name = 'name',
  MigrationStarted = 'migrationStarted',
  MigrationCompleted = 'migrationCompleted',
  Transfer = 'transfer',
  DiskCounter = 'diskCounter',
  Status = 'status',
}
