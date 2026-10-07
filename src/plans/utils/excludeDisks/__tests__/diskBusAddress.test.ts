import { describe, expect, it } from '@jest/globals';

import {
  formatDiskSizeLabel,
  getDiskBusAddress,
  getDiskCapacityBytes,
  getDiskFileName,
  getDiskShared,
} from '../diskBusAddress';

describe('getDiskBusAddress', () => {
  it('returns camelCase busAddress', () => {
    expect(getDiskBusAddress({ busAddress: 'scsi0:1' })).toBe('scsi0:1');
  });

  it('returns PascalCase BusAddress fallback', () => {
    expect(getDiskBusAddress({ BusAddress: 'scsi0:2' })).toBe('scsi0:2');
  });

  it('returns undefined when address is missing', () => {
    expect(getDiskBusAddress({ name: 'disk' })).toBeUndefined();
  });

  it('rejects non-string bus addresses', () => {
    expect(getDiskBusAddress({ busAddress: 12 })).toBeUndefined();
  });
});

describe('getDiskFileName', () => {
  it('reads file from inventory disk', () => {
    expect(getDiskFileName({ file: 'data.vmdk' })).toBe('data.vmdk');
  });
});

describe('getDiskCapacityBytes and formatDiskSizeLabel', () => {
  it('formats capacity as GiB', () => {
    expect(getDiskCapacityBytes({ capacity: 536870912000 })).toBe(536870912000);
    expect(formatDiskSizeLabel(536870912000)).toContain('GiB');
  });
});

describe('getDiskShared', () => {
  it('reads shared flag with PascalCase fallback', () => {
    expect(getDiskShared({ shared: true })).toBe(true);
    expect(getDiskShared({ Shared: false })).toBe(false);
  });
});
