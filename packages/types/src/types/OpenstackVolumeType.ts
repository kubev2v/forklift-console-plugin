/** Represents an Openstack volume type. */
export interface OpenstackVolumeType {
  /** The unique identifier of the volume type. */
  id: string;
  /** The revision number of the volume type. */
  revision: number;
  /** The display name of the volume type. */
  name: string;
  /** The self link of the volume type. */
  selfLink: string;
}
