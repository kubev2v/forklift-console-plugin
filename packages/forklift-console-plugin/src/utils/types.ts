import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

export type Condition = {
  /** identification string for the condition */
  type: string;
  /** 'True' | 'False' indication for this condition */
  status: string;
  /** human readable message */
  message: string;
  /** higher order category this condition relates to */
  category?: string;
  /** Items related to this conditions */
  items?: string[];
  /** timestamp RFC 3339 */
  lastTransitionTime?: string;
  /** shorter computer friendly version of message */
  reason?: string;
};

export type ResourceConsolePageProps = {
  kind: string;
  namespace: string;
};

export interface ProviderRef {
  name: string;
  gvk: K8sGroupVersionKind;
  ready: boolean;
  resolved: boolean;
}

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
