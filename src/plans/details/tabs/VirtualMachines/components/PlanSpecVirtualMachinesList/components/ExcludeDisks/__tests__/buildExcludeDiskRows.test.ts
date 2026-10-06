import { describe, expect, it } from '@jest/globals';

import { buildExcludeDiskRows } from '../buildExcludeDiskRows';

describe('buildExcludeDiskRows', () => {
  it('maps inventory disks to table rows', () => {
    const rows = buildExcludeDiskRows({
      disks: [
        {
          busAddress: 'scsi0:0',
          capacity: 85899345920,
          file: 'root.vmdk',
          shared: false,
        },
        { BusAddress: 'scsi0:1', Capacity: 536870912000, File: 'data.vmdk', Shared: true },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].busAddress).toBe('scsi0:0');
    expect(rows[0].fileName).toBe('root.vmdk');
    expect(rows[0].shared).toBe(false);
    expect(rows[0].sizeLabel).toContain('GiB');
    expect(rows[1].shared).toBe(true);
    expect(rows[1].sharedFilterValue).toBe('yes');
  });

  it('merges YAML-only exclude addresses', () => {
    const rows = buildExcludeDiskRows({
      disks: [{ busAddress: 'scsi0:0', file: 'a.vmdk' }],
      existingExcludeDisks: ['scsi9:9'],
    });

    expect(rows.map((row) => row.id)).toEqual(['scsi0:0', 'scsi9:9']);
    expect(rows.find((row) => row.id === 'scsi9:9')?.inInventory).toBe(false);
  });
});
