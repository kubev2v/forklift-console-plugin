/** Represents a vSphere data store. */
export interface VSphereDataStores {
  /** The unique identifier of the data store. */
  id: string;
  /** The parent of the data store. */
  parent: DataStoresParent;
  /** The path of the data store. */
  path: string;
  /** The revision number of the data store. */
  revision: number;
  /** The display name of the data store. */
  name: string;
  /** The self link of the data store. */
  selfLink: string;
}

/** Represents a parent item for a data store. */
export interface DataStoresParent {
  /** The kind of the parent item. */
  kind: string;
  /** The unique identifier of the parent item. */
  id: string;
}
