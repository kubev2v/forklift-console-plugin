import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type {
  ProviderType,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';

export type SpecVirtualMachinePageData = {
  plan: V1beta1Plan;
  vmIndex: number;
  specVM: V1beta1PlanSpecVms;
  sourceProviderType?: ProviderType;
  statusVM?: V1beta1PlanStatusMigrationVms;
  conditions?: V1beta1PlanStatusConditions[];
  inventoryVmData: VmData;
  targetNamespace: string;
};

export enum PlanSpecVirtualMachinesTableResourceId {
  Name = 'name',
  Concerns = 'concerns',
  InspectionStatus = 'inspectionStatus',
  InstanceType = 'instanceType',
  MigrateSharedDisks = 'migrateSharedDisks',
  VMTargetName = 'vmTargetName',
  TargetPowerState = 'targetPowerState',
  Actions = 'actions',
}
