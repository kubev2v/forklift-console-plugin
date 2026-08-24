import { StorageVendorProduct } from '../types';
import { resolveProductFromDatastore } from '../vendorLookupTables';

describe('resolveProductFromDatastore', () => {
  const hostScsiDisks = [
    { canonicalName: 'naa.600508b400105e834000200000490000', vendor: 'IBM' },
    { canonicalName: 'naa.624a9370aef5214a38ee4fa500011234', vendor: 'PURE' },
    { canonicalName: 'naa.60060160b1234f00abcd1234abcd1234', vendor: 'NETAPP' },
  ];

  it('resolves vendor from matching backing device', () => {
    const datastore = {
      backingDevicesNames: ['naa.624a9370aef5214a38ee4fa500011234'],
    };

    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBe(
      StorageVendorProduct.PureFlashArray,
    );
  });

  it('returns first matching vendor when multiple backing devices exist', () => {
    const datastore = {
      backingDevicesNames: [
        'naa.624a9370aef5214a38ee4fa500011234',
        'naa.600508b400105e834000200000490000',
      ],
    };

    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBe(
      StorageVendorProduct.PureFlashArray,
    );
  });

  it('returns undefined when no backing device matches', () => {
    const datastore = {
      backingDevicesNames: ['naa.unknown_device'],
    };

    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBeUndefined();
  });

  it('returns undefined when backingDevicesNames is empty', () => {
    const datastore = { backingDevicesNames: [] };
    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBeUndefined();
  });

  it('falls back to name-based resolution when backingDevicesNames is missing', () => {
    const datastore = { name: 'pure-vvol1' };
    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBe(
      StorageVendorProduct.PureFlashArray,
    );
  });

  it('falls back to name-based resolution when backingDevicesNames is empty', () => {
    const datastore = { backingDevicesNames: [], name: 'netappnfs' };
    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBe(
      StorageVendorProduct.Ontap,
    );
  });

  it('returns undefined when datastore is undefined', () => {
    expect(resolveProductFromDatastore(undefined, hostScsiDisks)).toBeUndefined();
  });

  it('returns undefined when no backing devices match and name has no vendor hint', () => {
    const datastore = {
      backingDevicesNames: ['naa.unknown_device'],
      name: 'generic-datastore',
    };

    expect(resolveProductFromDatastore(datastore as never, hostScsiDisks)).toBeUndefined();
  });
});
