import { OVirtHostNIC, OVirtNetworkAttachment } from './model';
import { OVirtResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/host.go
export interface OVirtHost extends OVirtResource {
  // Cluster            string              `json:"cluster"`
  cluster: string;
  // Status             string              `json:"status"`
  status: string;
  // ProductName        string              `json:"productName"`
  productName: string;
  // ProductVersion     string              `json:"productVersion"`
  productVersion: string;
  // InMaintenance      bool                `json:"inMaintenance"`
  inMaintenance: boolean;
  // CpuSockets         int16               `json:"cpuSockets"`
  cpuSockets: number;
  // CpuCores           int16               `json:"cpuCores"`
  cpuCores: number;
  // NetworkAttachments []NetworkAttachment `json:"networkAttachments"`
  networkAttachments: OVirtNetworkAttachment[];
  // NICs               []hNIC              `json:"nics"`
  nics: OVirtHostNIC[];
}
