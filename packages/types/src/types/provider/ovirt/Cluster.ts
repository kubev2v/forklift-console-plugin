import { TypedOVirtResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/cluster.go
export interface OVirtCluster extends TypedOVirtResource {
  // 	DataCenter    string `json:"dataCenter"`
  dataCenter: string;
  // 	HaReservation bool   `json:"haReservation"`
  haReservation: boolean;
  // 	KsmEnabled    bool   `json:"ksmEnabled"`
  ksmEnabled: boolean;
  // 	BiosType      string `json:"biosType"`
  biosType: string;
}
