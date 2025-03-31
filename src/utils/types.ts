export const ProviderStatusValues = [
  'ValidationFailed',
  'ConnectionFailed',
  'Ready',
  'Staging',
  'Unknown',
] as const;
export type ProviderStatus = (typeof ProviderStatusValues)[number];

export type VmFeatures = {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
};
