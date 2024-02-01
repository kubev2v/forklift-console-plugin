import { Attachment } from './model';
import { TypedOpenstackResource } from './TypedResource';

// https://github.com/kubev2v/forklift/blob/main/pkg/controller/provider/web/openstack/volume.go
export interface OpenstackVolume extends TypedOpenstackResource {
  // Status              string            `json:"status"`
  status: string;
  // Size                int               `json:"size"`
  size: number;
  // AvailabilityZone    string            `json:"availabilityZone"`
  availabilityZone: string;
  // CreatedAt           time.Time         `json:"createdAt"`
  createdAt: string;
  // UpdatedAt           time.Time         `json:"updatedAt"`
  updatedAt: string;
  // Attachments         []Attachment      `json:"attachments"`
  attachments: Attachment[];
  // Description         string            `json:"description,omitempty"`
  description?: string;
  // VolumeType          string            `json:"volumeType"`
  volumeType: string;
  // SnapshotID          string            `json:"snapshotID,omitempty"`
  snapshotID?: string;
  // SourceVolID         string            `json:"sourceVolID,omitempty"`
  sourceVolID?: string;
  // BackupID            *string           `json:"backupID,omitempty"`
  backupID?: string;
  // Metadata            map[string]string `json:"metadata,omitempty"`
  metadata?: { [key: string]: string };
  // UserID              string            `json:"userID"`
  userID: string;
  // Bootable            string            `json:"bootable"`
  bootable: string;
  // Encrypted           bool              `json:"encrypted"`
  encrypted: boolean;
  // ReplicationStatus   string            `json:"replicationStatus"`
  replicationStatus: string;
  // ConsistencyGroupID  string            `json:"consistencygroupID,omitempty"`
  consistencygroupID?: string;
  // Multiattach         bool              `json:"multiattach"`
  multiattach: boolean;
  // VolumeImageMetadata map[string]string `json:"volumeImageMetadata,omitempty"`
  volumeImageMetadata?: { [key: string]: string };
}
