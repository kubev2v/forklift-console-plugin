import type { FC } from 'react';
import SmartLinkify from 'src/components/common/SmartLinkify';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { isEmpty } from '@utils/helpers';

import type { ProviderIssuesPanelData } from './utils/types';

type MessageTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const MessageTableCell: FC<MessageTableCellProps> = ({ fieldsData }) => {
  const message = fieldsData?.condition?.message;

  if (isEmpty(message)) {
    return <TableEmptyCell />;
  }

  return (
    <TableCell isWrap={true}>
      <SmartLinkify>{message}</SmartLinkify>
    </TableCell>
  );
};

export default MessageTableCell;
