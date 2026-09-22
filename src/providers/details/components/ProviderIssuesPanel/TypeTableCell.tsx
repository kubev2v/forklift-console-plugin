import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import { EMPTY_MSG } from '@utils/constants';

import type { ProviderIssuesPanelData } from './utils/types';

type TypeTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const TypeTableCell: FC<TypeTableCellProps> = ({ fieldsData }) => {
  return <TableCell>{fieldsData?.condition?.type ?? EMPTY_MSG}</TableCell>;
};

export default TypeTableCell;
