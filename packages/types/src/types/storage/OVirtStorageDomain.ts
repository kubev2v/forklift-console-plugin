/** Represents an oVirt storage domain. */
export interface OVirtStorageDomain {
  /** The unique identifier of the storage domain. */
  id: string;
  /** The revision number of the storage domain. */
  revision: number;
  /** The display name of the storage domain. */
  name: string;
  /** The self link of the storage domain. */
  selfLink: string;
  /** The path of the storage domain (optional). */
  path?: string | null;
}
