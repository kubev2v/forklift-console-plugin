import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';

export type MigrationStatusVirtualMachinePageData = {
  dvs: V1beta1DataVolume[];
  jobs: IoK8sApiBatchV1Job[];
  plan: V1beta1Plan;
  pods: IoK8sApiCoreV1Pod[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  targetNamespace: string;
  vmIndex?: number;
};

export enum MigrationStatusVirtualMachinesTableResourceId {
  Name = 'name',
  MigrationStarted = 'migrationStarted',
  MigrationCompleted = 'migrationCompleted',
  Transfer = 'transfer',
  DiskCounter = 'diskCounter',
  Status = 'status',
}
