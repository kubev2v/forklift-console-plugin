import {
  getRootDiskLabelByKey,
  isNotFirstKeyOrRootFilesystem,
} from '../utils';

jest.mock('@utils/i18n', () => ({
  t: (key: string) => key,
}));

describe('getRootDiskLabelByKey - labels', () => {
  it('defaults to First root device when key is missing', () => {
    expect(getRootDiskLabelByKey(undefined)).toBe('First root device');
    expect(getRootDiskLabelByKey('')).toBe('First root device');
  });

  it.each([
    ['/dev/sda', 'First HD (/dev/sda)'],
    ['/dev/sdb', 'Second HD (/dev/sdb)'],
    ['/dev/sdc1', 'Third HD 1 partition (/dev/sdc1)'],
    ['/dev/sdj', 'Tenth HD (/dev/sdj)'],
  ])('formats %s as %s', (key, label) => {
    expect(getRootDiskLabelByKey(key)).toBe(label);
  });

  it('returns the raw key for unrecognized /dev/sd shapes', () => {
    expect(getRootDiskLabelByKey('/dev/sd!')).toBe('/dev/sd!');
    expect(getRootDiskLabelByKey('/dev/sdaX')).toBe('/dev/sdaX');
    expect(getRootDiskLabelByKey('/dev/sd')).toBe('/dev/sd');
  });

  it('returns non-/dev/sd keys unchanged', () => {
    expect(getRootDiskLabelByKey('custom-disk')).toBe('custom-disk');
    expect(getRootDiskLabelByKey(42)).toBe('42');
  });
});

describe('isNotFirstKeyOrRootFilesystem - guards', () => {
  it('is false for empty, undefined, and /dev/sd* roots', () => {
    expect(isNotFirstKeyOrRootFilesystem(undefined)).toBe(false);
    expect(isNotFirstKeyOrRootFilesystem('')).toBe(false);
    expect(isNotFirstKeyOrRootFilesystem('/dev/sda')).toBe(false);
    expect(isNotFirstKeyOrRootFilesystem('/dev/sdb2')).toBe(false);
  });

  it('is true for custom disk keys', () => {
    expect(isNotFirstKeyOrRootFilesystem('custom-disk')).toBe(true);
    expect(isNotFirstKeyOrRootFilesystem('/dev/nvme0n1')).toBe(true);
  });
});
