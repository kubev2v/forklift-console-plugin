import { V1beta1Provider } from '../models/V1beta1Provider';

/**
 * Represents the inventory of providers, including their entities.
 */
export interface ProvidersInventory {
  openshift?: OpenshiftInventory[] | null;
  openstack?: OpenstackInventory[] | null;
  ovirt?: OVirtInventory[] | null;
  vsphere?: VSphereInventory[] | null;
}

/**
 * General provider inventory
 */
export type ProviderInventory =
  | OpenshiftInventory
  | VSphereInventory
  | OVirtInventory
  | OpenstackInventory;

/**
 * Represents an entity in an OpenShift provider.
 */
export interface OpenshiftInventory {
  /** The unique identifier of the entity. */
  uid: string;
  /** The version of the OpenShift provider. */
  version: string;
  /** The namespace of the entity. */
  namespace: string;
  /** The name of the entity. */
  name: string;
  /** The self link of the entity. */
  selfLink: string;
  /** The type of the entity. */
  type: 'openshift';
  /** The object associated with the entity. */
  object: V1beta1Provider;
  /** The number of virtual machines associated with the entity. */
  vmCount: number;
  /** The number of networks associated with the entity. */
  networkCount: number;
  /** The number of storage classes associated with the entity. */
  storageClassCount: number;
}

/**
 * Represents an entity in an oVirt provider.
 */
export interface OVirtInventory {
  /** The unique identifier of the entity. */
  uid: string;
  /** The version of the oVirt provider. */
  version: string;
  /** The namespace of the entity. */
  namespace: string;
  /** The name of the entity. */
  name: string;
  /** The self link of the entity. */
  selfLink: string;
  /** The type of the entity. */
  type: 'ovirt';
  /** The object associated with the entity. */
  object: V1beta1Provider;
  /** The number of data centers associated with the entity. */
  datacenterCount: number;
  /** The number of clusters associated with the entity. */
  clusterCount: number;
  /** The number of hosts associated with the entity. */
  hostCount: number;
  /** The number of virtual machines associated with the entity. */
  vmCount: number;
  /** The number of networks associated with the entity. */
  networkCount: number;
  /** The number of storage domains associated with the entity. */
  storageDomainCount: number;
}

/**
 * Represents an entity in a vSphere provider.
 */
export interface VSphereInventory {
  /** The unique identifier of the entity. */
  uid: string;
  /** The version of the vSphere provider. */
  version: string;
  /** The namespace of the entity. */
  namespace: string;
  /** The name of the entity. */
  name: string;
  /** The self link of the entity. */
  selfLink: string;
  /** The type of the entity. */
  type: 'openshift';
  /** The object associated with the entity. */
  object: V1beta1Provider;
  /** The API version of the vSphere provider. */
  apiVersion: string;
  /** The product associated with the vSphere provider. */
  product: string;
  /** The number of data centers associated with the entity. */
  datacenterCount: number;
  /** The number of clusters associated with the entity. */
  clusterCount: number;
  /** The number of hosts associated with the entity. */
  hostCount: number;
  /** The number of virtual machines associated with the entity. */
  vmCount: number;
  /** The number of networks associated with the entity. */
  networkCount: number;
  /** The number of datastores associated with the entity. */
  datastoreCount: number;
}

/**
 * Represents an entity in an OpenStack provider.
 */
export interface OpenstackInventory {
  /** The unique identifier of the entity. */
  uid: string;
  /** The version of the OpenStack provider. */
  version: string;
  /** The namespace of the entity. */
  namespace: string;
  /** The name of the entity. */
  name: string;
  /** The self link of the entity. */
  selfLink: string;
  /** The type of the entity. */
  type: 'openstack';
  /** The object associated with the entity. */
  object: V1beta1Provider;
  /** The number of regions associated with the entity. */
  regionCount: number;
  /** The number of projects associated with the entity. */
  projectCount: number;
  /** The number of virtual machines associated with the entity. */
  vmCount: number;
  /** The number of images associated with the entity. */
  imageCount: number;
  /** The number of volumes associated with the entity. */
  volumeCount: number;
  /** The number of volume types associated with the entity. */
  volumeTypeCount: number;
  /** The number of networks associated with the entity. */
  networkCount: number;
}
