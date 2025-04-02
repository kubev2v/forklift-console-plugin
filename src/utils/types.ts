export type ProviderStatus =
  | 'ValidationFailed'
  | 'ConnectionFailed'
  | 'Ready'
  | 'Staging'
  | 'Unknown';

export type VmFeatures = {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
};
