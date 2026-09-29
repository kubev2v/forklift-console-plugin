import { describe, expect, it } from '@jest/globals';

import {
  areExcludeDiskSelectionsEqual,
  getExcludeDiskSelectOptions,
  getSelectableBusAddresses,
  wouldExcludeAllDisks,
} from '../getExcludeDiskSelectOptions';

describe('getExcludeDiskSelectOptions', () => {
  it('builds options from inventory disks', () => {
    const options = getExcludeDiskSelectOptions({
      disks: [{ busAddress: 'scsi0:0', file: 'root.vmdk' }, { busAddress: 'scsi0:1' }],
    });

    expect(options).toHaveLength(2);
    expect(options[0].value).toBe('scsi0:0');
    expect(String(options[0].content)).toContain('root.vmdk');
  });

  it('merges YAML-only exclude addresses into options', () => {
    const options = getExcludeDiskSelectOptions({
      disks: [{ busAddress: 'scsi0:0' }],
      existingExcludeDisks: ['scsi9:9'],
    });

    expect(options.map((option) => option.value)).toEqual(['scsi0:0', 'scsi9:9']);
  });

  it('skips disks without bus address', () => {
    const options = getExcludeDiskSelectOptions({
      disks: [{ name: 'orphan' }, { busAddress: 'scsi0:1' }],
    });

    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('scsi0:1');
  });
});

describe('getSelectableBusAddresses', () => {
  it('returns all bus addresses from disks', () => {
    expect(
      getSelectableBusAddresses([{ busAddress: 'scsi0:0' }, { BusAddress: 'scsi0:1' }]),
    ).toEqual(['scsi0:0', 'scsi0:1']);
  });
});

describe('areExcludeDiskSelectionsEqual', () => {
  it('compares selections regardless of order', () => {
    expect(areExcludeDiskSelectionsEqual(['scsi0:1', 'scsi0:0'], ['scsi0:0', 'scsi0:1'])).toBe(
      true,
    );
  });
});

describe('wouldExcludeAllDisks', () => {
  it('returns true when every selectable disk is excluded', () => {
    expect(wouldExcludeAllDisks(['scsi0:0', 'scsi0:1'], ['scsi0:0', 'scsi0:1'])).toBe(true);
  });

  it('returns false when some disks remain', () => {
    expect(wouldExcludeAllDisks(['scsi0:1'], ['scsi0:0', 'scsi0:1'])).toBe(false);
  });
});
