import type { OpenShiftStorageClass } from '@forklift-ui/types';

import { StorageVendorProduct } from '../types';
import {
  resolveProductFromCsiProvisioner,
  resolveProductFromDatastore,
  resolveProductFromDatastoreName,
  resolveProductFromScsiVendor,
  resolveProductFromStorageClass,
} from '../vendorLookupTables';

describe('resolveProductFromScsiVendor', () => {
  it.each([
    ['PURE', StorageVendorProduct.PureFlashArray],
    ['NETAPP', StorageVendorProduct.Ontap],
    ['DGC', StorageVendorProduct.PowerFlex],
    ['DellEMC', StorageVendorProduct.PowerStore],
    ['DELL', StorageVendorProduct.PowerStore],
    ['EMC', StorageVendorProduct.PowerMax],
    ['IBM', StorageVendorProduct.FlashSystem],
    ['HITACHI', StorageVendorProduct.Vantara],
    ['3PARdata', StorageVendorProduct.Primera3Par],
    ['HPE', StorageVendorProduct.Primera3Par],
    ['INFINIDAT', StorageVendorProduct.Infinibox],
  ])('resolves "%s" to %s', (vendor, expected) => {
    expect(resolveProductFromScsiVendor(vendor)).toBe(expected);
  });

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

describe('resolveProductFromCsiProvisioner', () => {
  it.each([
    ['pxd.portworx.com', StorageVendorProduct.PureFlashArray],
    ['csi.trident.netapp.io', StorageVendorProduct.Ontap],
    ['csi-powerstore.dellemc.com', StorageVendorProduct.PowerStore],
    ['csi-vxflexos.dellemc.com', StorageVendorProduct.PowerFlex],
    ['csi-powermax.dellemc.com', StorageVendorProduct.PowerMax],
    ['block.csi.ibm.com', StorageVendorProduct.FlashSystem],
    ['csi.hpe.com', StorageVendorProduct.Primera3Par],
    ['hspc.csi.hitachi.com', StorageVendorProduct.Vantara],
    ['infinibox-csi-driver', StorageVendorProduct.Infinibox],
  ])('resolves "%s" to %s', (provisioner, expected) => {
    expect(resolveProductFromCsiProvisioner(provisioner)).toBe(expected);
  });

  it('handles case-insensitive matching', () => {
    expect(resolveProductFromCsiProvisioner('CSI.TRIDENT.NETAPP.IO')).toBe(
      StorageVendorProduct.Ontap,
    );
  });

  it('returns undefined for unknown provisioners', () => {
    expect(resolveProductFromCsiProvisioner('kubernetes.io/no-provisioner')).toBeUndefined();
    expect(resolveProductFromCsiProvisioner('')).toBeUndefined();
  });
});

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

describe('resolveProductFromDatastore', () => {
  const hostScsiDisks = [
    { canonicalName: 'naa.600508b400105e834000200000490000', vendor: 'IBM' },
    { canonicalName: 'naa.624a9370aef5214a38ee4fa500011234', vendor: 'PURE' },
    { canonicalName: 'naa.60060160b1234f00abcd1234abcd1234', vendor: 'DGC' },
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

describe('resolveProductFromDatastoreName', () => {
  it.each([
    ['pure-vvol1', StorageVendorProduct.PureFlashArray],
    ['netappnfs', StorageVendorProduct.Ontap],
    ['HITACHI-ds-01', StorageVendorProduct.Vantara],
    ['ibm_flashsystem_lun3', StorageVendorProduct.FlashSystem],
    ['hpe-primera-vol1', StorageVendorProduct.Primera3Par],
    ['infinidat-prod', StorageVendorProduct.Infinibox],
    ['Dell-PowerStore-01', StorageVendorProduct.PowerStore],
  ])('resolves "%s" to %s', (name, expected) => {
    expect(resolveProductFromDatastoreName(name)).toBe(expected);
  });

  it('prefers longer vendor key when names overlap', () => {
    expect(resolveProductFromDatastoreName('dellemc-powermax-lun')).toBe(
      StorageVendorProduct.PowerStore,
    );
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
