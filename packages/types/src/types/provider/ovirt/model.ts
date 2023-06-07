// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/model.go

export interface OVirtSnapshot {
  // ID            string `json:"id"`
  id: string;
  // Description   string `json:"description"`
  description: string;
  // Type          string `json:"type"`
  type: string;
  // PersistMemory bool   `json:"persistMemory"`
  persistMemory: boolean;
}

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/model.go
export interface OVirtProperty {
  // Name  string `json:"name"`
  name: string;
  // Value string `json:"value"`
  value: string;
}

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/model.go
export interface OVirtNetworkAttachment {
  // ID      string `json:"id"`
  id: string;
  // Network string `json:"network"`
  network: string;
}

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/model.go
export interface OVirtHostNIC {
  // ID        string `json:"id"`
  id: string;
  // Name      string `json:"name"`
  name: string;
  // LinkSpeed int64  `json:"linkSpeed"`
  linkSpeed: string;
  // MTU       int64  `json:"mtu"`
  mtu: string;
  // VLan      string `json:"vlan"`
  vlan: string;
}

export interface OVirtNIC {
  // ID        string      `json:"id"`
  id: string;
  // Name      string      `json:"name"`
  name: string;
  // i.e. 'virtio' | 'e1000' | 'rtl8139'
  // Interface string      `json:"interface"`
  interface: string;
  // Plugged   bool        `json:"plugged"`
  plugged: boolean;
  // IpAddress []IpAddress `json:"ipAddress"`
  ipAddress: IpAddress[];
  // Profile   string      `json:"profile"`
  profile: string;
  // MAC       string      `json:"mac"`
  mac: string;
}

interface IpAddress {
  // Address string `json:"address"`
  address: string;
  // Version string `json:"version"`
  version: string;
}

export interface OVirtDiskAttachment {
  // ID              string `json:"id"`
  id: string;
  // Interface       string `json:"interface"`
  interface: string;
  // SCSIReservation bool   `json:"scsiReservation"`
  scsiReservation: boolean;
  // Disk            string `json:"disk"`
  disk: string;
}
