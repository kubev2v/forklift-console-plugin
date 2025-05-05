import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { t } from '@utils/i18n';

export const diskOptions = [
  {
    description: t('Boot from first root device'),
    key: '',
  },
  {
    description: t('Boot from the first hard drive'),
    key: '/dev/sda',
  },
  {
    description: t('Boot from the first partition on the first hard drive'),
    key: '/dev/sda1',
  },
  {
    description: t('Boot from the second partition on the first hard drive'),
    key: '/dev/sda2',
  },
  {
    description: t('Boot from the second hard drive'),
    key: '/dev/sdb',
  },
  {
    description: t('Boot from the first partition on the second hard drive'),
    key: '/dev/sdb1',
  },
  {
    description: t('Boot from the second partition on the second hard drive'),
    key: '/dev/sdb2',
  },
];

export const isNotFirstKeyOrRootFilesystem = (diskKey: string | undefined): boolean =>
  Boolean(diskKey) && !diskKey?.startsWith('/dev/sd');
/**
 * Gets the label for a root disk by its key.
 * @param {string | number} diskKey - The key representing the disk option.
 * @returns {string} The label for the root disk.
 */
export const getRootDiskLabelByKey = (diskKey: string | number | undefined): string => {
  const diskLetters = 'abcdefghijklmnopqrstuvwxyz';
  const partitionNumbers = '0123456789';

  // Default is first root disk
  if (!diskKey) {
    return t('First root device');
  }

  const key = diskKey.toString();

  if (key.startsWith('/dev/sd') && key.length >= 8) {
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
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

export const onConfirmRootDisk = async (resource: V1beta1Plan, newValue: string) => {
  const vms = getPlanVirtualMachines(resource);
  const op = vms ? REPLACE : ADD;

  const updatedVMs = vms.map((vm) => ({
    ...vm,
    rootDisk: newValue || undefined,
  }));

  return k8sPatch({
    data: [
      {
        op,
        path: '/spec/vms',
        value: updatedVMs,
      },
    ],
    model: PlanModel,
    resource,
  });
};
