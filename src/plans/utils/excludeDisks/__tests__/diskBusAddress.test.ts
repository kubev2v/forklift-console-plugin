import { describe, expect, it } from '@jest/globals';

import { getDiskBusAddress, getExcludeDiskOptionLabel } from '../diskBusAddress';

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
});

describe('getExcludeDiskOptionLabel', () => {
  it('includes file and capacity when present', () => {
    const label = getExcludeDiskOptionLabel(
      { busAddress: 'scsi0:1', file: 'data.vmdk', capacity: 536870912000 },
      'scsi0:1',
    );

    expect(label).toContain('scsi0:1');
    expect(label).toContain('data.vmdk');
    expect(label).toContain('GiB');
  });

  it('returns bus address only when disk metadata is missing', () => {
    expect(getExcludeDiskOptionLabel({}, 'scsi9:9')).toBe('scsi9:9');
  });
});
