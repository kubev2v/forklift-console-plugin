import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { getMigrateSharedDisksValue } from 'src/plans/details/tabs/Details/components/SettingsSection/components/PlanMigrateSharedDisks/utils/utils';

import type { V1beta1Plan } from '@forklift-ui/types';
import { t } from '@utils/i18n';

type VMMigrateSharedDisksCellRendererProps = {
  migrateSharedDisks: boolean | undefined;
  plan: V1beta1Plan;
};

const getSharedDisksLabel = (value: boolean): string =>
  value ? t('Migrate shared disks') : t('Do not migrate shared disks');

export const VMMigrateSharedDisksCellRenderer: FC<VMMigrateSharedDisksCellRendererProps> = ({
  migrateSharedDisks,
  plan,
}) => {
  const planValue = getMigrateSharedDisksValue(plan);

  if (migrateSharedDisks === undefined) {
    return (
      <TableCell>
        {getSharedDisksLabel(planValue)} {t('(Inherited from plan)')}
      </TableCell>
    );
  }

  return <TableCell>{getSharedDisksLabel(migrateSharedDisks)}</TableCell>;
};
