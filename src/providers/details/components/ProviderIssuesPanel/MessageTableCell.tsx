import type { FC } from 'react';
import SmartLinkify from 'src/components/common/SmartLinkify';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import type { ProviderIssuesPanelData } from './utils/types';

type MessageTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const MessageTableCell: FC<MessageTableCellProps> = ({ fieldsData }) => {
  const message = fieldsData?.condition?.message;

  return (
    <TableCell isWrap={true}>
      {message ? <SmartLinkify>{message}</SmartLinkify> : <TableEmptyCell />}
    </TableCell>
  );
};

export default MessageTableCell;
