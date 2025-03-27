import React, { FC } from 'react';

import { BulkSelect, BulkSelectValue } from '@patternfly/react-component-groups';

type TableBulkSelectProps = {
  selectedIds: string[];
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  dataIds: string[];
};

const TableBulkSelect: FC<TableBulkSelectProps> = ({
  selectedIds = [],
  pageDataIds = [],
  dataIds = [],
  onSelect,
}) => {
  const onBulkSelect = (value: BulkSelectValue) => {
    value === BulkSelectValue.none && onSelect([]);
    value === BulkSelectValue.all && onSelect(dataIds);
    value === BulkSelectValue.nonePage &&
      onSelect(selectedIds.filter((item) => !pageDataIds.includes(item)));
    value === BulkSelectValue.page &&
      onSelect(Array.from(new Set([...selectedIds, ...pageDataIds])));
  };

  return (
    <BulkSelect
      canSelectAll
      selectedCount={selectedIds.length}
      pageCount={pageDataIds.length}
      totalCount={dataIds.length}
      onSelect={onBulkSelect}
      {...(pageDataIds.length && {
        pageSelected: pageDataIds.every((item) => selectedIds.includes(item)),
        pagePartiallySelected:
          pageDataIds.some((item) => selectedIds.includes(item)) &&
          !pageDataIds.every((item) => selectedIds.includes(item)),
      })}
    />
  );
};

export default TableBulkSelect;
