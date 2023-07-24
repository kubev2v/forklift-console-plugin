/** Unified file containing typed provider secrets */

import {
  OpenShiftProviderSecret,
  OpenstackProviderSecret,
  OvaProviderSecret,
  OVirtProviderSecret,
  VSphereProviderSecret,
} from './secret';

export type ProviderType = 'openshift' | 'vsphere' | 'ovirt' | 'openstack' | 'ova';

/**
 * Provider secret containing credentials and other confidential information
 *
 * @export
 * @interface ProviderSecret
 */
export type ProviderSecret =
  | OpenShiftProviderSecret
  | VSphereProviderSecret
  | OVirtProviderSecret
  | OpenstackProviderSecret
  | OvaProviderSecret;
