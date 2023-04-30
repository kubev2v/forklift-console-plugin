/**
 * Represents a network inventory item.
 */
export interface NetworkInventory {
  /** The unique identifier of the network. */
  id: string;
  /** The revision number of the network. */
  revision: number;
  /** The display name of the network. */
  name: string;
  /** The self link of the network. */
  selfLink: string;
  /** The path of the network (optional). */
  path?: string | null;
  /** The description of the network (optional). */
  description?: string | null;
  /** The variant of the network (optional). */
  variant?: string | null;
  /** The parent network, if any (optional). */
  parent?: NetworkParent | null;
}

/**
 * Represents a network parent item.
 */
export interface NetworkParent {
  /** The kind of the parent network. */
  kind: string;
  /** The unique identifier of the parent network. */
  id: string;
}
