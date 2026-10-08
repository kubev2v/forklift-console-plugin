import type { FC, ReactNode } from 'react';

import { Tr } from '@patternfly/react-table';

import { useDataViewCellScope } from './DataViewCellScope';

type TableRowProps = {
  children: ReactNode;
};

const TableRow: FC<TableRowProps> = ({ children }) => {
  const scope = useDataViewCellScope();
  if (scope) {
    return <>{children}</>;
  }
  return <Tr>{children}</Tr>;
};

export default TableRow;
