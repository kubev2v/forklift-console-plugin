import { IMigration, INetworkMapping, IPlan } from '@kubev2v/legacy/queries/types';
import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Condition = {
  /** identification string for the condition */
  type: string;
  /** 'True' | 'False' indication for this condition */
  status: string;
  /** human readable message */
  message: string;
  /** higher order category this condition relates to */
  category?: string;
  /** Items releated to this conditions */
  items?: string[];
  /** timestame RFC 3339 */
  lastTransitionTime?: string;
  /** shorter computer frendly version of message */
  reason?: string;
};

export type ProviderResource = {
  spec?: {
    type: string;
    url?: string;
    secret?: {
      name: string;
      namespace: string;
    };
  };
  status?: {
    conditions?: Condition[];
  };
} & K8sResourceCommon;

export type PlanResource = IPlan & K8sResourceCommon;

export type MigrationResource = IMigration & K8sResourceCommon;

export type NetworkMapResource = INetworkMapping & K8sResourceCommon & { kind: 'NetworkMap' };

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
