import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { isEmpty } from '@utils/helpers';

import type { ProviderIssuesPanelData } from './utils/types';

type TypeTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const TypeTableCell: FC<TypeTableCellProps> = ({ fieldsData }) => {
  const type = fieldsData?.condition?.type;

  if (isEmpty(type)) {
    return <TableEmptyCell />;
  }

  return <TableCell>{type}</TableCell>;
};

export default TypeTableCell;
