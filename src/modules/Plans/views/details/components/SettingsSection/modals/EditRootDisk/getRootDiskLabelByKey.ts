/**
 * Type definition for DiskOption.
 * @typedef {Object} DiskOption
 * @property {string} key - The key representing the disk option.
 * @property {string} description - The description of the disk option.
 */
export type DiskOption = {
  key: string;
  description: string;
};

/**
 * Generates an array of disk options.
 * @param {Function} [t=(text: string) => text] - Translation function.
 * @returns {DiskOption[]} Array of disk options.
 */
export const diskOptions = (t = (text: string) => text): DiskOption[] => [
  { description: t('Boot from first root device'), key: '' },
  { description: t('Boot from the first hard drive'), key: '/dev/sda' },
  {
    description: t('Boot from the first partition on the first hard drive'),
    key: '/dev/sda1',
  },
  {
    description: t('Boot from the second partition on the first hard drive'),
    key: '/dev/sda2',
  },
  { description: t('Boot from the second hard drive'), key: '/dev/sdb' },
  {
    description: t('Boot from the first partition on the second hard drive'),
    key: '/dev/sdb1',
  },
  {
    description: t('Boot from the second partition on the second hard drive'),
    key: '/dev/sdb2',
  },
];

/**
 * Gets the label for a root disk by its key.
 * @param {string | number} key_ - The key representing the disk option.
 * @returns {string} The label for the root disk.
 */
export const getRootDiskLabelByKey = (key_: string | number): string => {
  const diskLetters = 'abcdefghijklmnopqrstuvwxyz';
  const partitionNumbers = '0123456789';

  // Default is first root disk
  if (!key_) {
    return 'First root device';
  }

  const key = key_.toString();

  if (key.startsWith('/dev/sd') && key.length >= 8) {
    const diskLetter = key[7];
    const partitionNumber = key.length > 8 ? key.slice(8) : '';

    const diskIndex = diskLetters.indexOf(diskLetter);
    if (diskIndex === -1 || (partitionNumber && !partitionNumbers.includes(partitionNumber[0]))) {
      // If format is unrecognized, just return the key as label
      return key;
    }

    const diskPosition = [
      'First',
      'Second',
      'Third',
      'Fourth',
      'Fifth',
      'Sixth',
      'Seventh',
      'Eighth',
      'Ninth',
      'Tenth',
    ][diskIndex];
    const partitionPosition = partitionNumber ? `${partitionNumber} partition` : '';

    return `${diskPosition} HD${partitionPosition ? ` ${partitionPosition}` : ''} (${key})`;
  }
  // If format is unrecognized, just return the key as label
  return key;
};
