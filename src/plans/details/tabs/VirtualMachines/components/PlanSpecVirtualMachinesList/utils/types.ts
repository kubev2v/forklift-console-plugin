import type {
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

export type SpecVirtualMachinePageData = {
  plan: V1beta1Plan;
  vmIndex: number;
  specVM: V1beta1PlanSpecVms;
  statusVM?: V1beta1PlanStatusMigrationVms;
  conditions?: V1beta1PlanStatusConditions[];
  targetNamespace: string;
};

export enum PlanSpecVirtualMachinesTableResourceId {
  Name = 'name',
  Conditions = 'conditions',
  Actions = 'actions',
}
