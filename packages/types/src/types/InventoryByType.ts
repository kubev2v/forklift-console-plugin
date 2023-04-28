import {
  OpenshiftInventory,
  OpenstackInventory,
  OVirtInventory,
  VSphereInventory,
} from './provider';

/**
 * Represents the inventory of providers, including their entities.
 */
export interface InventoryByType {
  openshift?: OpenshiftInventory[] | null;
  openstack?: OpenstackInventory[] | null;
  ovirt?: OVirtInventory[] | null;
  vsphere?: VSphereInventory[] | null;
}
