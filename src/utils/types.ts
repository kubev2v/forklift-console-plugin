import type { FEATURE_NAMES } from './constants';

export enum ProviderStatus {
  ValidationFailed = 'ValidationFailed',
  ConnectionFailed = 'ConnectionFailed',
  Ready = 'Ready',
  Staging = 'Staging',
  Unknown = 'Unknown',
  ApplianceManagementEnabled = 'ApplianceManagementEnabled',
}

export type VmFeatures = {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
};

export type FeatureName = (typeof FEATURE_NAMES)[keyof typeof FEATURE_NAMES];

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
  canPatch: boolean;
  canDelete: boolean;
  canGet: boolean;
  loading: boolean;
};
