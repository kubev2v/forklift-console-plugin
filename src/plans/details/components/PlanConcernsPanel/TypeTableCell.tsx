import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';

import type { PlanConcernsPanelData } from './utils/types';

type TypeTableCellProps = {
  fieldsData: PlanConcernsPanelData;
};

const TypeTableCell: FC<TypeTableCellProps> = ({ fieldsData }) => {
  const condition = fieldsData?.criticalConditionOrConcern;

  return <TableCell isWrap={true}>{condition?.message ?? <TableEmptyCell />}</TableCell>;
};

export default TypeTableCell;
