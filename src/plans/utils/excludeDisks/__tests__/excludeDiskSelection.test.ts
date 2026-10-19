import { describe, expect, it } from '@jest/globals';

import { areExcludeDiskSelectionsEqual, wouldExcludeAllDisks } from '../excludeDiskSelection';

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
