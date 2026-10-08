import type { FC } from 'react';

import { Td } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';

import { useDataViewCellScope } from '../common/DataViewTable/DataViewCellScope';

/**
 * A component that renders an empty cell with a dash symbol (-).
 * @returns {JSX.Element} The JSX element representing the empty cell.
 */
export const TableEmptyCell: FC = () => {
  const scope = useDataViewCellScope();
  if (scope) {
    return <>{EMPTY_MSG}</>;
  }
  return <Td>{EMPTY_MSG}</Td>;
};
