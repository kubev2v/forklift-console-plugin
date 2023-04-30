/**
 * Represents the inventory of a vSphere host.
 */
export interface VSphereHostInventory {
  /** The unique identifier of the host. */
  id: string;
  /** The parent object of the host, which could be a network, datastore, or another parent object. */
  parent: HostParent;
  /** The path of the host in the vSphere inventory tree. */
  path: string;
  /** The revision number of the host. */
  revision: number;
  /** The name of the host. */
  name: string;
  /** The self-link of the host. */
  selfLink: string;
  /** The name of the cluster the host belongs to. */
  cluster: string;
  /** The status of the host. */
  status: string;
  /** Indicates whether the host is in maintenance mode. */
  inMaintenance: boolean;
  /** The IP address of the management server for the host. */
  managementServerIp: string;
  /** The thumbprint of the host's SSL certificate. */
  thumbprint: string;
  /** The time zone of the host. */
  timezone: string;
  /** The number of CPU sockets on the host. */
  cpuSockets: number;
  /** The number of CPU cores on the host. */
  cpuCores: number;
  /** The name of the product running on the host. */
  productName: string;
  /** The version of the product running on the host. */
  productVersion: string;
  /** The networking configuration for the host. */
  networking: Networking;
  /** The list of networks available on the host. */
  networks?: HostParent[] | null;
  /** The list of datastores available on the host. */
  datastores?: HostParent[] | null;
  /** The list of network adapters on the host. */
  networkAdapters?: NetworkAdapters[] | null;
}

/**
 * Represents an entity that can be a network, datastore, or parent object.
 */
export interface HostParent {
  /** The type of entity. */
  kind: string;
  /** The unique identifier of the entity. */
  id: string;
}

/**
 * Represents the networking configuration for a vSphere host.
 */
export interface Networking {
  /** The list of physical NICs on the host. */
  pNICs?: PNICs[] | null;
  /** The list of virtual NICs on the host. */
  vNICs?: VNICs[] | null;
  /** The list of port groups on the host. */
  portGroups?: PortGroups[] | null;
  /** The list of switches on the host. */
  switches?: Switches[] | null;
}

/**
 * Represents a physical NIC on a vSphere host.
 */
export interface PNICs {
  /** The unique identifier of the physical NIC. */
  key: string;
  /** The link speed of the physical NIC. */
  linkSpeed: number;
}

/**
 * Represents a virtual NIC on a vSphere host.
 */
export interface VNICs {
  /** The unique identifier of the virtual NIC. */
  key: string;
  /** The port group the virtual NIC is connected to. */
  portGroup: string;
  /** The distributed port group the virtual NIC is connected to. */
  dPortGroup: string;
  /** The IP address of the virtual NIC. */
  ipAddress: string;
  /** The subnet mask of the virtual NIC. */
  subnetMask: string;
  /** The maximum transmission unit (MTU) of the virtual NIC. */
  mtu: number;
}

/**
 * Represents a port group on a vSphere host.
 */
export interface PortGroups {
  /** The unique identifier of the port group. */
  key: string;
  /** The name of the port group. */
  name: string;
  /** The virtual switch the port group is connected to. */
  vSwitch: string;
}

/**
 * Represents a switch on a vSphere host.
 */
export interface Switches {
  /** The unique identifier of the switch. */
  key: string;
  /** The name of the switch. */
  name: string;
  /** The list of port groups on the switch. */
  portGroups?: string[] | null;
  /** The list of physical NICs connected to the switch. */
  pNICs?: string[] | null;
}

/**
 * Represents a network adapter on a vSphere host.
 */
export interface NetworkAdapters {
  /** The name of the network adapter. */
  name: string;
  /** The IP address of the network adapter. */
  ipAddress: string;
  /** The subnet mask of the network adapter. */
  subnetMask: string;
  /** The link speed of the network adapter. */
  linkSpeed: number;
  /** The maximum transmission unit (MTU) of the network adapter. */
  mtu: number;
}
