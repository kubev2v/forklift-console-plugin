export const ProviderStatusValues = [
  'ValidationFailed',
  'ConnectionFailed',
  'Ready',
  'Staging',
  'Unknown',
] as const;
export type ProviderStatus = (typeof ProviderStatusValues)[number];

export interface VmFeatures {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
}
