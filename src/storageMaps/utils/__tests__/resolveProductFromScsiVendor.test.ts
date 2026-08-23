import { StorageVendorProduct } from '../types';
import { resolveProductFromScsiVendor } from '../vendorLookupTables';

describe('resolveProductFromScsiVendor', () => {
  it.each([
    ['PURE', StorageVendorProduct.PureFlashArray],
    ['NETAPP', StorageVendorProduct.Ontap],
    ['IBM', StorageVendorProduct.FlashSystem],
    ['HITACHI', StorageVendorProduct.Vantara],
    ['3PARdata', StorageVendorProduct.Primera3Par],
    ['HPE', StorageVendorProduct.Primera3Par],
    ['INFINIDAT', StorageVendorProduct.Infinibox],
  ])('resolves "%s" to %s', (vendor, expected) => {
    expect(resolveProductFromScsiVendor(vendor)).toBe(expected);
  });

  it.each(['DGC', 'DellEMC', 'DELL', 'EMC'])(
    'returns undefined for ambiguous Dell/EMC vendor "%s"',
    (vendor) => {
      expect(resolveProductFromScsiVendor(vendor)).toBeUndefined();
    },
  );

  it('handles case-insensitive matching', () => {
    expect(resolveProductFromScsiVendor('pure')).toBe(StorageVendorProduct.PureFlashArray);
    expect(resolveProductFromScsiVendor('NetApp')).toBe(StorageVendorProduct.Ontap);
  });

  it('handles whitespace-padded vendor strings', () => {
    expect(resolveProductFromScsiVendor('  PURE  ')).toBe(StorageVendorProduct.PureFlashArray);
    expect(resolveProductFromScsiVendor('IBM   ')).toBe(StorageVendorProduct.FlashSystem);
  });

  it('returns undefined for unknown vendors', () => {
    expect(resolveProductFromScsiVendor('UNKNOWN')).toBeUndefined();
    expect(resolveProductFromScsiVendor('')).toBeUndefined();
  });
});
