import type { ProviderVirtualMachine } from '@forklift-ui/types';

import type { FEATURE_NAMES } from './constants';

export type ProviderVmData = {
  folderName?: string;
  hostName?: string;
  isProviderLocalOpenshift?: boolean;
  name: string;
  namespace: string;
  vm: ProviderVirtualMachine;
};

export enum ProviderStatus {
  ValidationFailed = 'ValidationFailed',
  ConnectionFailed = 'ConnectionFailed',
  Ready = 'Ready',
  Staging = 'Staging',
  Unknown = 'Unknown',
  ApplianceManagementEnabled = 'ApplianceManagementEnabled',
}

export type VmFeatures = {
  dedicatedCpu?: boolean;
  gpusHostDevices?: boolean;
  numa?: boolean;
  persistentTpmEfi?: boolean;
};

export type FeatureName = (typeof FEATURE_NAMES)[keyof typeof FEATURE_NAMES];

export type MappingValue = { id?: string; name: string; vlan?: string };

/**
 * Type for the return value of access review hooks.
 *
 * @typedef {Object} PermissionStatus
 * @property {boolean} canCreate - Permission to create a resource.
 * @property {boolean} canPatch - Permission to patch a resource.
 * @property {boolean} canDelete - Permission to delete a resource.
 * @property {boolean} canGet - Permission to get a resource.
 * @property {boolean} loading - Flag indicating if any access review is pending.
 */
export type PermissionStatus = {
  canCreate: boolean;
  canDelete: boolean;
  canGet: boolean;
  canPatch: boolean;
  loading: boolean;
};
