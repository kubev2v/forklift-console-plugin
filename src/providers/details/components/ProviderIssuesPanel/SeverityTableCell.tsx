import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { getCategoryLabel, getCategoryStatus } from '@components/Concerns/utils/category';
import { Label } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { ProviderIssuesPanelData } from './utils/types';

type SeverityTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const SeverityTableCell: FC<SeverityTableCellProps> = ({ fieldsData }) => {
  const severity = fieldsData?.condition?.severity;

  if (isEmpty(severity)) {
    return <TableEmptyCell />;
  }

  return (
    <TableCell>
      <Label status={getCategoryStatus(severity)}>{getCategoryLabel(severity)}</Label>
    </TableCell>
  );
};

export default SeverityTableCell;
