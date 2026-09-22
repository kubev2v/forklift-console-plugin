import type { FC } from 'react';
import SmartLinkify from 'src/components/common/SmartLinkify';
import { TableCell } from 'src/components/TableCell/TableCell';

import { EMPTY_MSG } from '@utils/constants';

import type { ProviderIssuesPanelData } from './utils/types';

type MessageTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const MessageTableCell: FC<MessageTableCellProps> = ({ fieldsData }) => {
  const message = fieldsData?.condition?.message;

  return (
    <TableCell isWrap={true}>
      {message ? <SmartLinkify>{message}</SmartLinkify> : EMPTY_MSG}
    </TableCell>
  );
};

export default MessageTableCell;
