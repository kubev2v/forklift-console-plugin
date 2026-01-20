import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { getCategoryStatus } from '@components/Concerns/utils/category';
import { Label } from '@patternfly/react-core';

import type { PlanConcernsPanelData } from './utils/types';

type SeverityTableCellProps = {
  fieldsData: PlanConcernsPanelData;
};

const SeverityTableCell: FC<SeverityTableCellProps> = ({ fieldsData }) => {
  const condition = fieldsData?.criticalConditionOrConcern;

  return (
    <TableCell>
      {condition?.severity ? (
        <Label status={getCategoryStatus(condition?.severity)}>{condition?.severity}</Label>
      ) : (
        <TableEmptyCell />
      )}
    </TableCell>
  );
};

export default SeverityTableCell;
