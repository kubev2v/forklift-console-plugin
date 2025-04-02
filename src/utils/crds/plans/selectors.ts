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
