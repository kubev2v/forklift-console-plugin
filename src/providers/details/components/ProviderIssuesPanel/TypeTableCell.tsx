import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import type { ProviderIssuesPanelData } from './utils/types';

type TypeTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const TypeTableCell: FC<TypeTableCellProps> = ({ fieldsData }) => {
  return <TableCell>{fieldsData?.condition?.type ?? <TableEmptyCell />}</TableCell>;
};

export default TypeTableCell;
