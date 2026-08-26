import { describe, expect, it } from '@jest/globals';

import { getAccessModeOptions, isRwxCapableProvisioner } from '../constants';

describe('storageMaps constants - provisioners', () => {
  it('detects RWX-capable ceph provisioners', () => {
    expect(isRwxCapableProvisioner('rbd.csi.ceph.com')).toBe(true);
    expect(isRwxCapableProvisioner('cephfs.csi.ceph.com')).toBe(true);
    expect(isRwxCapableProvisioner('kubernetes.io/aws-ebs')).toBe(false);
  });

  it('exposes access mode options including default', () => {
    const options = getAccessModeOptions();
    expect(options[0]).toEqual({ label: 'Default', value: '' });
    expect(options.length).toBeGreaterThan(1);
  });
});
