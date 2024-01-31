// https://github.com/kubev2v/forklift/blob/main/pkg/controller/provider/model/openstack/model.go
export interface Attachment {
  // AttachedAt   time.Time `sql:""`
  attachedAt: string;
  // AttachmentID string    `sql:""`
  attachmentID: string;
  // Device       string    `sql:""`
  device: string;
  // HostName     string    `sql:""`
  hostName: string;
  // ID           string    `sql:""`
  id: string;
  // ServerID     string    `sql:""`
  serverID: string;
  // VolumeID     string    `sql:""`
  volumeID: string;
}
