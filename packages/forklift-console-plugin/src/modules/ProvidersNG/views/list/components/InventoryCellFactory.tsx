import React, { ReactNode } from 'react';
import { TableEmptyCell, TableIconCell } from 'src/modules/ProvidersNG/utils';

import { getResourceFieldValue } from '@kubev2v/common';

import { CellProps } from './CellProps';

/**
 * Factory function for creating InventoryCell components.
 * @param {Object} param0 - The icon for the component.
 * @returns {Function} - A function that returns a TableIconCell component.
 */
export const InventoryCellFactory: CellFactory = ({ icon }) => {
  /**
   * Inner function that returns a TableIconCell component.
   * @param {CellProps} param1 - The props for the component.
   * @returns {JSX.Element} - The rendered component.
   */
  // eslint-disable-next-line react/display-name
  return ({ data, fieldId, fields }: CellProps) => {
    const { provider, inventory } = data;
    const value = getResourceFieldValue({ ...provider, inventory }, fieldId, fields);

    if (value === undefined) {
      return <TableEmptyCell />;
    }
    return <TableIconCell icon={icon}>{value}</TableIconCell>;
  };
};

type CellFactory = (props: { icon: ReactNode }) => React.FC<CellProps>;
