import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1CopyAppliance,
  V1beta1DataVolume,
  V1beta1Migration,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';

export type MigrationStatusVirtualMachinePageData = {
  activeMigration?: V1beta1Migration;
  copyAppliances: V1beta1CopyAppliance[];
  dvs: V1beta1DataVolume[];
  isWarm: boolean;
  jobs: IoK8sApiBatchV1Job[];
  migration?: V1beta1Migration;
  plan: V1beta1Plan;
  pods: IoK8sApiCoreV1Pod[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  targetNamespace: string;
  vmId: string;
  vmIndex: number;
  vmName: string;
};

export enum MigrationStatusVirtualMachinesTableResourceId {
  Name = 'name',
  MigrationStarted = 'migrationStarted',
  MigrationCompleted = 'migrationCompleted',
  Transfer = 'transfer',
  DiskCounter = 'diskCounter',
  Status = 'status',
  Cutover = 'cutover',
  Actions = 'actions',
}

export type MigrationResources = {
  error: unknown;
  loaded: boolean;
  migrationListData: MigrationStatusVirtualMachinePageData[];
};
