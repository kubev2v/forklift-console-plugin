export const ProviderStatusValues = [
  'ValidationFailed',
  'ConnectionFailed',
  'Ready',
  'Staging',
  'Unknown',
] as const;
export type ProviderStatus = (typeof ProviderStatusValues)[number];

export const MappingStatusValues = ['Ready', 'NotReady'] as const;
export type MappingStatus = (typeof MappingStatusValues)[number];

export interface VmFeatures {
  numa?: boolean;
  gpusHostDevices?: boolean;
  persistentTpmEfi?: boolean;
  dedicatedCpu?: boolean;
}
