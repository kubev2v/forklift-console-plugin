import type { FC } from 'react';

import { Th } from '@patternfly/react-table';

import type { TableViewHeaderProps } from '../../common/TableView/types';

/** Adds empty <Th> columns to align header with row expand/select checkboxes. */
export const createHeaderWithSelection = <T,>({
  header: HeaderComponent,
  isExpanded,
}: {
  header?: FC<TableViewHeaderProps<T>>;
  isExpanded?: (item: T) => boolean;
}) => {
  const HeaderWithSelection = ({ dataOnScreen, ...other }: TableViewHeaderProps<T>) => {
    return (
      <>
        {isExpanded && <Th />}
        {HeaderComponent && <HeaderComponent {...{ ...other, dataOnScreen }} />}
      </>
    );
  };

  return HeaderWithSelection;
};
