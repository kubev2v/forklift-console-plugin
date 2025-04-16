import type { V1beta1Plan } from '@kubev2v/types';

export const getPlanDestinationProvider = (plan: V1beta1Plan) =>
  plan?.spec?.provider?.destination ?? {};

export const getPlanSourceProvider = (plan: V1beta1Plan) => plan?.spec?.provider?.source ?? {};

export const getPlanMigrationStarted = (plan: V1beta1Plan) =>
  plan?.status?.migration?.started ?? '';

export const getPlanIsWarm = (plan: V1beta1Plan) => plan?.spec?.warm;

export const getPlanVirtualMachinesMigrationStatus = (plan: V1beta1Plan) =>
  plan?.status?.migration?.vms ?? [];

export const getPlanVirtualMachines = (plan: V1beta1Plan) => plan?.spec?.vms ?? [];

export const getPlanPreserveIP = (plan: V1beta1Plan) => plan?.spec?.preserveStaticIPs;

const getPlanMap = (plan: V1beta1Plan) => plan?.spec?.map;

const getPlanNetworkMap = (plan: V1beta1Plan) => getPlanMap(plan)?.network;

const getPlanStorageMap = (plan: V1beta1Plan) => getPlanMap(plan)?.storage;

export const getPlanStorageMapName = (plan: V1beta1Plan) => getPlanStorageMap(plan)?.name;

export const getPlanNetworkMapName = (plan: V1beta1Plan) => getPlanNetworkMap(plan)?.name;
