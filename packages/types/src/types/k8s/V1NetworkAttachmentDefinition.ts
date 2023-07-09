import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

export interface V1NetworkAttachmentDefinition {
  kind: 'NetworkAttachmentDefinition';
  apiVersion: 'k8s.cni.cncf.io/v1';
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  spec?: {
    config?: string; // JSON string of a CnoConfig type.
  };
}

/**
 * Represents a CNO configuration.
 */
export interface CnoConfig {
  /** The CNI specification version. The 0.3.1 value is required. */
  cniVersion: string;

  /** The value for the name parameter you provided previously for the CNO configuration. */
  name: string;

  /** The name of the CNI plugin to configure: bridge. */
  type: string;

  /** The configuration object for the IPAM CNI plugin. The plugin manages IP address assignment for the attachment definition. */
  ipam: object;

  /** Optional: Specify the name of the virtual bridge to use. If the bridge interface does not exist on the host, it is created. The default value is cni0. */
  bridge?: string;

  /** Optional: Set to true to enable IP masquerading for traffic that leaves the virtual network. The source IP address for all traffic is rewritten to the bridge’s IP address. If the bridge does not have an IP address, this setting has no effect. The default value is false. */
  ipMasq?: boolean;

  /** Optional: Set to true to assign an IP address to the bridge. The default value is false. */
  isGateway?: boolean;

  /** Optional: Set to true to configure the bridge as the default gateway for the virtual network. The default value is false. If isDefaultGateway is set to true, then isGateway is also set to true automatically. */
  isDefaultGateway?: boolean;

  /** Optional: Set to true to allow assignment of a previously assigned IP address to the virtual bridge. When set to false, if an IPv4 address or an IPv6 address from overlapping subsets is assigned to the virtual bridge, an error occurs. The default value is false. */
  forceAddress?: boolean;

  /** Optional: Set to true to allow the virtual bridge to send an Ethernet frame back through the virtual port it was received on. This mode is also known as reflective relay. The default value is false. */
  hairpinMode?: boolean;

  /** Optional: Set to true to enable promiscuous mode on the bridge. The default value is false. */
  promiscMode?: boolean;

  /** Optional: Specify a virtual LAN (VLAN) tag as an integer value. By default, no VLAN tag is assigned. */
  vlan?: string;

  /** Optional: Indicates whether the default vlan must be preserved on the veth end connected to the bridge. Defaults to true. */
  preserveDefaultVlan?: string;

  /** Optional: Assign a VLAN trunk tag. The default value is none. */
  vlanTrunk?: string[];

  /** Optional: Set the maximum transmission unit (MTU) to the specified value. The default value is automatically set by the kernel. */
  mtu?: string;

  /** Optional: Enables duplicate address detection for the container side veth. The default value is false. */
  enabledad?: boolean;

  /** Optional: Enables mac spoof check, limiting the traffic originating from the container to the mac address of the interface. The default value is false. */
  macspoofchk?: boolean;
}
