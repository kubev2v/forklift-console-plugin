import type { OpenShiftStorageClass, VSphereDataStore } from '@forklift-ui/types';

import { StorageVendorProduct } from './types';

/**
 * Dell/EMC IDs (dell, dellemc, dgc, emc) are intentionally excluded —
 * Dell produces PowerStore, PowerMax, AND PowerFlex and the SCSI vendor
 * string alone cannot distinguish between them. Use CSI provisioner instead.
 */
const SCSI_VENDOR_TO_PRODUCT: Record<string, StorageVendorProduct> = {
  '3pardata': StorageVendorProduct.Primera3Par,
  hitachi: StorageVendorProduct.Vantara,
  hpe: StorageVendorProduct.Primera3Par,
  ibm: StorageVendorProduct.FlashSystem,
  infinidat: StorageVendorProduct.Infinibox,
  netapp: StorageVendorProduct.Ontap,
  pure: StorageVendorProduct.PureFlashArray,
};

const DATASTORE_NAME_PRODUCT_PATTERNS: [string, StorageVendorProduct][] = [
  ['powerflex', StorageVendorProduct.PowerFlex],
  ['powermax', StorageVendorProduct.PowerMax],
  ['powerstore', StorageVendorProduct.PowerStore],
];

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

export const resolveProductFromDatastoreName = (
  name: string | undefined,
): StorageVendorProduct | undefined => {
  if (!name) {
    return undefined;
  }

  const normalized = name.toLowerCase();

  for (const [pattern, product] of DATASTORE_NAME_PRODUCT_PATTERNS) {
    if (normalized.includes(pattern)) {
      return product;
    }
  }

  for (const [vendorKey, product] of Object.entries(SCSI_VENDOR_TO_PRODUCT)) {
    if (normalized.includes(vendorKey)) {
      return product;
    }
  }

  return undefined;
};

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
