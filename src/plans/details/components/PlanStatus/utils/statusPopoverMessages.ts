import { t } from '@utils/i18n';

import { STATUS_POPOVER_VMS_COUNT_THRESHOLD } from './constants';
import { MigrationVirtualMachineStatus, type StatusPopoverLabels } from './types';

export const getPopoverMessageByStatus = (
  planStatus: MigrationVirtualMachineStatus,
  vmCount: number,
): StatusPopoverLabels => {
  const showAll = vmCount > STATUS_POPOVER_VMS_COUNT_THRESHOLD ? 'all ' : '';
  const isPlural = vmCount > 1 ? 's' : '';

  const popoverMessageMap: Record<MigrationVirtualMachineStatus, StatusPopoverLabels> = {
    [MigrationVirtualMachineStatus.Canceled]: {
      actionLabel: t('View {{showAll}}canceled VM{{isPlural}}', {
        isPlural,
        showAll,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration canceled', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.CantStart]: {
      actionLabel: t('View {{showAll}}VM{{isPlural}} that cannot start migration', {
        isPlural,
        showAll,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration cannot start', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.Failed]: {
      actionLabel: t('View {{showAll}}{{vmCount}} failed VM{{isPlural}}', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration failed', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.InProgress]: {
      actionLabel: t('View {{showAll}}{{vmCount}} VM{{isPlural}} in progress', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration in progress', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.Paused]: {
      actionLabel: t('Schedule cutover'),
      body: t(
        'To resume, the cutover must be scheduled. When the cutover starts the {{vmCount}} VM{{isPlural}} included in this plan will shut down.',
        { isPlural, vmCount },
      ),
      header: t('{{vmCount}} VM{{isPlural}} migration paused until cutover scheduled', {
        isPlural,
        vmCount,
      }),
    },
    [MigrationVirtualMachineStatus.Succeeded]: {
      actionLabel: t('View {{showAll}}{{vmCount}} fully migrated VM{{isPlural}}', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} fully migrated', { isPlural, vmCount }),
    },
  };

  return popoverMessageMap[planStatus] ?? { header: t('Unknown') };
};
