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
