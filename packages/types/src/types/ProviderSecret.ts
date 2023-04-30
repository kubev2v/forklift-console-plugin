/** Unified file containing typed provider secrets */

import { OpenShiftProviderSecret } from './secret/OpenShiftProviderSecret';
import { OpenstackProviderSecret } from './secret/OpenstackProviderSecret';
import { OVirtProviderSecret } from './secret/OVirtProviderSecret';
import { VSphereProviderSecret } from './secret/VSphereProviderSecret';

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
