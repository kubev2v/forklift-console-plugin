import type { OpenShiftStorageClass } from '@forklift-ui/types';

import { StorageVendorProduct } from '../types';
import { resolveProductFromStorageClass } from '../vendorLookupTables';

describe('resolveProductFromStorageClass', () => {
  it('resolves from StorageClass object provisioner', () => {
    const sc = {
      object: { provisioner: 'csi.trident.netapp.io' },
    } as OpenShiftStorageClass;

    expect(resolveProductFromStorageClass(sc)).toBe(StorageVendorProduct.Ontap);
  });

  it('returns undefined when StorageClass is undefined', () => {
    expect(resolveProductFromStorageClass(undefined)).toBeUndefined();
  });

  it('returns undefined when provisioner is missing', () => {
    const sc = { object: {} } as OpenShiftStorageClass;
    expect(resolveProductFromStorageClass(sc)).toBeUndefined();
  });
});
