import type { FC, ReactElement } from 'react';

import { Th } from '@patternfly/react-table';

import type { TableViewHeaderProps } from '../../common/TableView/types';

/** Adds empty <Th> columns to align header with row expand/select checkboxes. */
export const createHeaderWithSelection = <T,>({
  canSelect,
  header: HeaderComponent,
  isExpanded,
}: {
  canSelect?: boolean;
  header?: FC<TableViewHeaderProps<T>>;
  isExpanded?: (item: T) => boolean;
}): FC<TableViewHeaderProps<T>> => {
  const HeaderWithSelection = ({
    dataOnScreen,
    ...other
  }: TableViewHeaderProps<T>): ReactElement => {
    return (
      <>
        {isExpanded && <Th />}
        {HeaderComponent && <HeaderComponent {...{ ...other, canSelect, dataOnScreen }} />}
      </>
    );
  };

  return HeaderWithSelection;
};
