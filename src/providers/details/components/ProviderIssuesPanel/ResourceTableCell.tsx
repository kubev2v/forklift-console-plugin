import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { isEmpty } from '@utils/helpers';

import type { ProviderIssuesPanelData } from './utils/types';

type ResourceTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const ResourceTableCell: FC<ResourceTableCellProps> = ({ fieldsData }) => {
  const resource = fieldsData?.condition?.resource;

  if (isEmpty(resource)) {
    return <TableEmptyCell />;
  }

  return <TableCell>{resource}</TableCell>;
};

export default ResourceTableCell;
