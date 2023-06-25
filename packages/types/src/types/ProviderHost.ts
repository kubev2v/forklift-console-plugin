/** Unified file containing typed provider secrets */

import { OVirtHost, VSphereHost } from './provider';

/**
 * General provider host inventory
 */
export type ProviderHost = OVirtHost | VSphereHost;
