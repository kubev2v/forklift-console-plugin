import type { TargetPowerStateValue } from 'src/plans/constants';
import type {
  EnhancedPlan,
  EnhancedPlanSpecVms,
} from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import type { V1beta1Plan } from '@kubev2v/types';

export const getPlanDestinationProvider = (plan: V1beta1Plan) =>
  plan?.spec?.provider?.destination ?? {};

export const getPlanDestinationProviderName = (plan: V1beta1Plan) =>
  getPlanDestinationProvider(plan)?.name;

export const getPlanSourceProvider = (plan: V1beta1Plan) => plan?.spec?.provider?.source ?? {};

export const getPlanSourceProviderName = (plan: V1beta1Plan) => getPlanSourceProvider(plan)?.name;

export const getPlanMigrationStarted = (plan: V1beta1Plan) =>
  plan?.status?.migration?.started ?? '';

export const getPlanIsWarm = (plan: V1beta1Plan) => plan?.spec?.warm;

export const getPlanIsLive = (plan: V1beta1Plan) => plan?.spec?.type === 'live';

export const getPlanArchived = (plan: V1beta1Plan) => plan?.spec?.archived;

export const getPlanVirtualMachinesMigrationStatus = (plan: V1beta1Plan) =>
  plan?.status?.migration?.vms ?? [];

export const getPlanVirtualMachines = (plan: V1beta1Plan) => plan?.spec?.vms ?? [];

export const getPlanPreserveIP = (plan: V1beta1Plan) => plan?.spec?.preserveStaticIPs;

const getPlanMap = (plan: V1beta1Plan) => plan?.spec?.map;

const getPlanNetworkMap = (plan: V1beta1Plan) => getPlanMap(plan)?.network;

const getPlanStorageMap = (plan: V1beta1Plan) => getPlanMap(plan)?.storage;

export const getPlanStorageMapName = (plan: V1beta1Plan) => getPlanStorageMap(plan)?.name;

export const getPlanStorageMapNamespace = (plan: V1beta1Plan) => getPlanStorageMap(plan)?.namespace;

export const getPlanNetworkMapName = (plan: V1beta1Plan) => getPlanNetworkMap(plan)?.name;

export const getPlanNetworkMapNamespace = (plan: V1beta1Plan) => getPlanNetworkMap(plan)?.namespace;

export const getPlanTransferNetwork = (plan: V1beta1Plan) => plan?.spec?.transferNetwork;

export const getPlanTargetNamespace = (plan: V1beta1Plan) => plan?.spec?.targetNamespace;

export const getPlanPreserveClusterCpuModel = (plan: V1beta1Plan) =>
  plan?.spec?.preserveClusterCpuModel;

export const getLUKSSecretName = (plan: V1beta1Plan) => plan?.spec?.vms?.[0]?.luks?.name;

export const getPlanHasNBDEClevis = (plan: EnhancedPlan | V1beta1Plan): boolean =>
  (plan as EnhancedPlan)?.spec?.vms?.some((vm: EnhancedPlanSpecVms) => vm.nbdeClevis === true) ??
  false;

export const getRootDisk = (plan: V1beta1Plan) => plan?.spec?.vms?.[0]?.rootDisk;

export const getPlanTargetPowerState = (plan: EnhancedPlan | V1beta1Plan): TargetPowerStateValue =>
  (plan as EnhancedPlan)?.spec?.targetPowerState;
