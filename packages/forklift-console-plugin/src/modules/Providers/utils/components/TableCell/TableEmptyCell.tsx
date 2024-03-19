import React from 'react';

import { Td } from '@kubev2v/common';

/**
 * A component that renders an empty cell with a dash symbol (-).
 * @returns {JSX.Element} The JSX element representing the empty cell.
 */
export const TableEmptyCell: React.FC = () => {
  return <Td>-</Td>;
};
