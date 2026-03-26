import type { OpenShiftStorageClass, VSphereDataStore } from '@forklift-ui/types';

import { StorageVendorProduct } from './types';

/**
 * T10 SCSI Vendor ID -> StorageVendorProduct mapping.
 * Source: https://www.t10.org/lists/vid-alph.htm
 *
 * These are hardware-level identifiers reported by vSphere HostScsiDisk.Vendor.
 * The Forklift backend trims whitespace before returning them.
 */
const SCSI_VENDOR_TO_PRODUCT: Record<string, StorageVendorProduct> = {
  '3pardata': StorageVendorProduct.Primera3Par,
  dell: StorageVendorProduct.PowerStore,
  dellemc: StorageVendorProduct.PowerStore,
  dgc: StorageVendorProduct.PowerFlex,
  emc: StorageVendorProduct.PowerMax,
  hitachi: StorageVendorProduct.Vantara,
  hpe: StorageVendorProduct.Primera3Par,
  ibm: StorageVendorProduct.FlashSystem,
  infinidat: StorageVendorProduct.Infinibox,
  netapp: StorageVendorProduct.Ontap,
  pure: StorageVendorProduct.PureFlashArray,
};

/**
 * CSI provisioner string -> StorageVendorProduct mapping.
 * Source: https://kubernetes-csi.github.io/docs/drivers.html
 *
 * Entries are matched via substring inclusion against the StorageClass provisioner.
 */
const CSI_PROVISIONER_ENTRIES: [string, StorageVendorProduct][] = [
  ['block.csi.ibm.com', StorageVendorProduct.FlashSystem],
  ['csi-powermax.dellemc.com', StorageVendorProduct.PowerMax],
  ['csi-powerstore.dellemc.com', StorageVendorProduct.PowerStore],
  ['csi-vxflexos.dellemc.com', StorageVendorProduct.PowerFlex],
  ['csi.hpe.com', StorageVendorProduct.Primera3Par],
  ['csi.trident.netapp.io', StorageVendorProduct.Ontap],
  ['hspc.csi.hitachi.com', StorageVendorProduct.Vantara],
  ['infinibox-csi-driver', StorageVendorProduct.Infinibox],
  ['pxd.portworx.com', StorageVendorProduct.PureFlashArray],
];

type HostScsiDisk = {
  canonicalName: string;
  vendor: string;
  model?: string;
  key?: string;
};

type DatastoreWithBacking = VSphereDataStore & {
  backingDevicesNames?: string[];
};

export const resolveProductFromScsiVendor = (vendor: string): StorageVendorProduct | undefined => {
  return SCSI_VENDOR_TO_PRODUCT[vendor.trim().toLowerCase()];
};

export const resolveProductFromCsiProvisioner = (
  provisioner: string,
): StorageVendorProduct | undefined => {
  const normalized = provisioner.trim().toLowerCase();

  for (const [pattern, product] of CSI_PROVISIONER_ENTRIES) {
    if (normalized.includes(pattern)) {
      return product;
    }
  }

  return undefined;
};

export const resolveProductFromStorageClass = (
  storageClass: OpenShiftStorageClass | undefined,
): StorageVendorProduct | undefined => {
  const provisioner = storageClass?.object?.provisioner;

  if (!provisioner) {
    return undefined;
  }

  return resolveProductFromCsiProvisioner(provisioner);
};

/**
 * Heuristic fallback: checks if the datastore name contains a known vendor keyword.
 * Used when backingDevicesNames is not available (vVol, NFS datastores).
 *
 * Entries are sorted by key length descending so longer, more-specific keys
 * (e.g. "dellemc") match before shorter prefixes (e.g. "dell", "emc").
 */
export const resolveProductFromDatastoreName = (
  name: string | undefined,
): StorageVendorProduct | undefined => {
  if (!name) {
    return undefined;
  }

  const normalized = name.toLowerCase();

  const sortedEntries = Object.entries(SCSI_VENDOR_TO_PRODUCT).sort(
    ([a], [b]) => b.length - a.length,
  );

  for (const [vendorKey, product] of sortedEntries) {
    if (normalized.includes(vendorKey)) {
      return product;
    }
  }

  return undefined;
};

/**
 * Resolves the StorageVendorProduct for a datastore by:
 * 1. Correlating backingDevicesNames with Host SCSI disk canonical names (VMFS)
 * 2. Falling back to a name-based heuristic (vVol, NFS)
 */
export const resolveProductFromDatastore = (
  datastore: DatastoreWithBacking | undefined,
  hostScsiDisks: HostScsiDisk[],
): StorageVendorProduct | undefined => {
  const backingDevices = datastore?.backingDevicesNames;

  if (backingDevices?.length && hostScsiDisks.length) {
    for (const backingDevice of backingDevices) {
      const matchingDisk = hostScsiDisks.find((disk) => disk.canonicalName === backingDevice);

      if (matchingDisk?.vendor) {
        return resolveProductFromScsiVendor(matchingDisk.vendor);
      }
    }
  }

  return resolveProductFromDatastoreName(datastore?.name);
};

export type { DatastoreWithBacking, HostScsiDisk };
