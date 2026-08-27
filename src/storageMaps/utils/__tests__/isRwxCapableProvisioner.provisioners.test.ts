import { describe, expect, it } from '@jest/globals';
import { ACCESS_MODE } from '@utils/storage/types';

import { getAccessModeOptions, isRwxCapableProvisioner } from '../constants';

describe('storageMaps constants - provisioners', () => {
  it('detects RWX-capable ceph provisioners', () => {
    expect(isRwxCapableProvisioner('rbd.csi.ceph.com')).toBe(true);
    expect(isRwxCapableProvisioner('cephfs.csi.ceph.com')).toBe(true);
    expect(isRwxCapableProvisioner('kubernetes.io/aws-ebs')).toBe(false);
  });

  it('exposes access mode options including default', () => {
    expect(getAccessModeOptions().map((option) => option.value)).toEqual([
      '',
      ACCESS_MODE.ReadWriteOnce,
      ACCESS_MODE.ReadWriteMany,
      ACCESS_MODE.ReadOnlyMany,
    ]);
  });
});
