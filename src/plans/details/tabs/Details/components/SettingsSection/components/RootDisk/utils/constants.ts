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
