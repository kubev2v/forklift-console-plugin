import type { FC, ReactNode } from 'react';

import { Tr } from '@patternfly/react-table';

type TableRowProps = {
  children: ReactNode;
};

const TableRow: FC<TableRowProps> = ({ children }) => <Tr>{children}</Tr>;

export default TableRow;
