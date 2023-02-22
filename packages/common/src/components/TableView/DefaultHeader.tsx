import React from 'react';
import { useTranslation } from 'common/src/utils/i18n';

import { Th } from '@patternfly/react-table';

import { buildSort } from './sort';
import { TableViewHeaderProps } from './types';

export const DefaultHeader = ({
  visibleColumns,
  setActiveSort,
  activeSort,
}: TableViewHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      {visibleColumns.map(({ id, toLabel, sortable }, columnIndex) => (
        <Th
          key={id}
          sort={
            sortable &&
            buildSort({
              activeSort,
              columnIndex,
              columns: visibleColumns,
              setActiveSort,
            })
          }
        >
          {toLabel(t)}
        </Th>
      ))}
    </>
  );
};
