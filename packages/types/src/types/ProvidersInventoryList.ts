import {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from './provider';

/**
 * Represents the inventory of providers, including their entities.
 */
export interface ProvidersInventoryList {
  openshift?: OpenshiftProvider[] | null;
  openstack?: OpenstackProvider[] | null;
  ovirt?: OVirtProvider[] | null;
  vsphere?: VSphereProvider[] | null;
  ova?: OvaProvider[] | null;
}
