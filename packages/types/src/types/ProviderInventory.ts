import {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from './provider';

/**
 * General provider inventory
 */
export type ProviderInventory =
  | OpenshiftProvider
  | OpenstackProvider
  | OVirtProvider
  | VSphereProvider
  | OvaProvider;
