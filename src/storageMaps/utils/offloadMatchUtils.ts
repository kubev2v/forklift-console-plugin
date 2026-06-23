import { OffloadMatchStatus, type StorageVendorProduct } from './types';

export const deriveMatchStatus = (
  datastoreVendor: StorageVendorProduct | undefined,
  storageClassVendor: StorageVendorProduct | undefined,
  selectedProduct: StorageVendorProduct | undefined,
): OffloadMatchStatus => {
  const defined = [datastoreVendor, storageClassVendor, selectedProduct].filter(Boolean);

  if (defined.length < 2) {
    return OffloadMatchStatus.Incomplete;
  }

  const allEqual = defined.every((val) => val === defined[0]);

  if (allEqual) {
    return OffloadMatchStatus.Optimal;
  }

  return OffloadMatchStatus.Suboptimal;
};

export const deriveSuggestedProduct = (
  datastoreVendor: StorageVendorProduct | undefined,
  storageClassVendor: StorageVendorProduct | undefined,
): StorageVendorProduct | undefined => {
  if (datastoreVendor && storageClassVendor && datastoreVendor === storageClassVendor) {
    return datastoreVendor;
  }

  // CSI provisioner is unambiguous; SCSI/name-based detection may not be (Dell/EMC)
  return storageClassVendor ?? datastoreVendor;
};
