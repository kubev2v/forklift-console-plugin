import type {
  V1beta1Plan,
  V1beta1PlanSpecMap,
  V1beta1PlanSpecMapNetwork,
  V1beta1PlanSpecMapStorage,
  V1beta1PlanSpecProviderDestination,
  V1beta1PlanSpecProviderSource,
  V1beta1PlanSpecTransferNetwork,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';
import type { TargetPowerStateValue } from '@utils/plans/constants';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

export const getPlanDestinationProvider = (plan: V1beta1Plan): V1beta1PlanSpecProviderDestination =>
  plan?.spec?.provider?.destination ?? {};

export const getPlanDestinationProviderName = (plan: V1beta1Plan): string | undefined =>
  getPlanDestinationProvider(plan)?.name;

export const getPlanDestinationProviderNamespace = (plan: V1beta1Plan): string | undefined =>
  getPlanDestinationProvider(plan)?.namespace;

export const getPlanSourceProvider = (plan: V1beta1Plan): V1beta1PlanSpecProviderSource =>
  plan?.spec?.provider?.source ?? {};

export const getPlanSourceProviderName = (plan: V1beta1Plan): string | undefined =>
  getPlanSourceProvider(plan)?.name;

export const getPlanSourceProviderNamespace = (plan: V1beta1Plan): string | undefined =>
  getPlanSourceProvider(plan)?.namespace;

export const getPlanMigrationStarted = (plan: V1beta1Plan): string =>
  plan?.status?.migration?.started ?? '';

export const getPlanIsWarm = (plan: V1beta1Plan): boolean | undefined => plan?.spec?.warm;

export const getPlanArchived = (plan: V1beta1Plan): boolean | undefined => plan?.spec?.archived;

export const getPlanVirtualMachinesMigrationStatus = (
  plan: V1beta1Plan,
): V1beta1PlanStatusMigrationVms[] => plan?.status?.migration?.vms ?? [];

export const getPlanVirtualMachines = (plan: V1beta1Plan): V1beta1PlanSpecVms[] =>
  plan?.spec?.vms ?? [];

export const getPlanPreserveIP = (plan: V1beta1Plan): boolean | undefined =>
  plan?.spec?.preserveStaticIPs;

const getPlanMap = (plan: V1beta1Plan): V1beta1PlanSpecMap | undefined => plan?.spec?.map;

const getPlanNetworkMap = (plan: V1beta1Plan): V1beta1PlanSpecMapNetwork | undefined =>
  getPlanMap(plan)?.network;

const getPlanStorageMap = (plan: V1beta1Plan): V1beta1PlanSpecMapStorage | undefined =>
  getPlanMap(plan)?.storage;

export const getPlanStorageMapName = (plan: V1beta1Plan): string | undefined =>
  getPlanStorageMap(plan)?.name;

export const getPlanStorageMapNamespace = (plan: V1beta1Plan): string | undefined =>
  getPlanStorageMap(plan)?.namespace;

export const getPlanNetworkMapName = (plan: V1beta1Plan): string | undefined =>
  getPlanNetworkMap(plan)?.name;

export const getPlanNetworkMapNamespace = (plan: V1beta1Plan): string | undefined =>
  getPlanNetworkMap(plan)?.namespace;

export const getPlanTransferNetwork = (
  plan: V1beta1Plan,
): V1beta1PlanSpecTransferNetwork | undefined => plan?.spec?.transferNetwork;

export const getPlanTargetNamespace = (plan: V1beta1Plan): string | undefined =>
  plan?.spec?.targetNamespace;

export const getPlanPreserveClusterCpuModel = (plan: V1beta1Plan): boolean | undefined =>
  plan?.spec?.preserveClusterCpuModel;

export const getLUKSSecretName = (plan: V1beta1Plan): string | undefined =>
  plan?.spec?.vms?.[0]?.luks?.name;

export const getPlanHasNBDEClevis = (plan: V1beta1Plan): boolean =>
  plan?.spec?.vms?.some((vm: EnhancedPlanSpecVms) => vm.nbdeClevis === true) ?? false;

export const getRootDisk = (plan: V1beta1Plan): string | undefined =>
  plan?.spec?.vms?.[0]?.rootDisk;

export const getPlanTargetPowerState = (plan: V1beta1Plan): TargetPowerStateValue =>
  plan?.spec?.targetPowerState;

export const getPlanDescription = (plan: V1beta1Plan): string | undefined =>
  plan?.spec?.description;
