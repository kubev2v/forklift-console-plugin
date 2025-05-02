import type { FC } from 'react';
import { EMPTY_CELL_CONTENT } from 'src/providers/list/components/utils/constants';

import { Td } from '@patternfly/react-table';

/**
 * A component that renders an empty cell with a dash symbol (-).
 * @returns {JSX.Element} The JSX element representing the empty cell.
 */
export const TableEmptyCell: FC = () => {
  return <Td>{EMPTY_CELL_CONTENT}</Td>;
};
