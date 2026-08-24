import { StorageVendorProduct } from '../types';
import { resolveProductFromCsiProvisioner } from '../vendorLookupTables';

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
