export enum ProviderStatus {
  ValidationFailed = 'ValidationFailed',
  ConnectionFailed = 'ConnectionFailed',
  Ready = 'Ready',
  Staging = 'Staging',
  Unknown = 'Unknown',
}

export type VmFeatures = {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
};
