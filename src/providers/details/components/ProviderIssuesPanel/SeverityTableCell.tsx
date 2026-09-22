import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import { getCategoryLabel, getCategoryStatus } from '@components/Concerns/utils/category';
import { Label } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';

import type { ProviderIssuesPanelData } from './utils/types';

type SeverityTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const SeverityTableCell: FC<SeverityTableCellProps> = ({ fieldsData }) => {
  const severity = fieldsData?.condition?.severity;

  return (
    <TableCell>
      {severity ? (
        <Label status={getCategoryStatus(severity)}>{getCategoryLabel(severity)}</Label>
      ) : (
        EMPTY_MSG
      )}
    </TableCell>
  );
};

export default SeverityTableCell;
