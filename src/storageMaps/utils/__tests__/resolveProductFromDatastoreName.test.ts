import { StorageVendorProduct } from '../types';
import { resolveProductFromDatastoreName } from '../vendorLookupTables';

describe('resolveProductFromDatastoreName', () => {
  it.each([
    ['pure-vvol1', StorageVendorProduct.PureFlashArray],
    ['netappnfs', StorageVendorProduct.Ontap],
    ['HITACHI-ds-01', StorageVendorProduct.Vantara],
    ['ibm_flashsystem_lun3', StorageVendorProduct.FlashSystem],
    ['hpe-primera-vol1', StorageVendorProduct.Primera3Par],
    ['infinidat-prod', StorageVendorProduct.Infinibox],
  ])('resolves "%s" to %s', (name, expected) => {
    expect(resolveProductFromDatastoreName(name)).toBe(expected);
  });

  it.each([
    ['Dell-PowerStore-01', StorageVendorProduct.PowerStore],
    ['eco-powermax-ds1', StorageVendorProduct.PowerMax],
    ['eco-dellpf-powerflex', StorageVendorProduct.PowerFlex],
  ])('resolves product-specific Dell name "%s" to %s', (name, expected) => {
    expect(resolveProductFromDatastoreName(name)).toBe(expected);
  });

  it('prefers product-specific pattern over generic vendor key', () => {
    expect(resolveProductFromDatastoreName('dellemc-powermax-lun')).toBe(
      StorageVendorProduct.PowerMax,
    );
  });

  it('returns undefined for ambiguous Dell/EMC names without product hint', () => {
    expect(resolveProductFromDatastoreName('dell-storage-01')).toBeUndefined();
    expect(resolveProductFromDatastoreName('emc-lun-05')).toBeUndefined();
  });

  it('still resolves unambiguous vendors in names', () => {
    expect(resolveProductFromDatastoreName('infinidat-ds01')).toBe(StorageVendorProduct.Infinibox);
  });

  it('returns undefined for names without vendor hints', () => {
    expect(resolveProductFromDatastoreName('generic-datastore')).toBeUndefined();
    expect(resolveProductFromDatastoreName('iscsi-lun-01')).toBeUndefined();
  });

  it('returns undefined for empty or undefined name', () => {
    expect(resolveProductFromDatastoreName('')).toBeUndefined();
    expect(resolveProductFromDatastoreName(undefined)).toBeUndefined();
  });
});
