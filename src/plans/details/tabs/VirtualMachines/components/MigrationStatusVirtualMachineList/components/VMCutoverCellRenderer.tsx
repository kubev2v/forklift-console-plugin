import type { FC } from 'react';
import { getIsInheritedVmCutover } from 'src/plans/components/CutoverModal/utils/utils';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { TableCell } from '@components/TableCell/TableCell';
import type { V1beta1Migration } from '@forklift-ui/types';
import { t } from '@utils/i18n';

type VMCutoverCellRendererProps = {
  migration: V1beta1Migration;
  vmId: string;
};

export const VMCutoverCellRenderer: FC<VMCutoverCellRendererProps> = ({ migration, vmId }) => {
  const { cutover, isInherited } = getIsInheritedVmCutover(migration, vmId);

  const inheritMessage = isInherited && cutover ? t('(Inherited from plan)') : undefined;

  return (
    <TableCell>
      <ConsoleTimestamp showGlobalIcon={false} timestamp={cutover} />
      {inheritMessage}
    </TableCell>
  );
};
