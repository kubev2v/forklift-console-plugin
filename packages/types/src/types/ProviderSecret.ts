/** Unified file containing typed provider secrets */

import { OpenShiftProviderSecret } from './OpenShiftProviderSecret';
import { OpenstackProviderSecret } from './OpenstackProviderSecret';
import { OVirtProviderSecret } from './OVirtProviderSecret';
import { VSphereProviderSecret } from './VSphereProviderSecret';

export type ProviderType = 'openshift' | 'vsphere' | 'ovirt' | 'openstack';

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
  | OpenstackProviderSecret;
