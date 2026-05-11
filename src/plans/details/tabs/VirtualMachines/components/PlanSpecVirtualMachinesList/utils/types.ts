import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type {
  ProviderType,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

export type SpecVirtualMachinePageData = {
  conditions?: V1beta1PlanStatusConditions[];
  inspectionStatus?: VmInspectionStatus;
  inventoryVmData: VmData;
  plan: V1beta1Plan;
  sourceProviderType?: ProviderType;
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  targetNamespace: string;
  vmIndex: number;
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
