import { type FC, useCallback } from 'react';

import { BulkSelect, BulkSelectValue } from '@patternfly/react-component-groups';
import { isEmpty } from '@utils/helpers';

type TableBulkSelectProps = {
  selectedIds: string[];
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  dataIds: string[];
};

const TableBulkSelect: FC<TableBulkSelectProps> = ({
  dataIds = [],
  onSelect,
  pageDataIds = [],
  selectedIds = [],
}) => {
  const pageSelected = pageDataIds.every((item) => selectedIds.includes(item));
  const pagePartiallySelected =
    pageDataIds.some((item) => selectedIds.includes(item)) && !pageSelected;

  const onBulkSelect = useCallback(
    (value: BulkSelectValue) => {
      switch (value) {
        case BulkSelectValue.all:
          onSelect(dataIds);
          break;
        case BulkSelectValue.nonePage:
          onSelect(selectedIds.filter((item) => !pageDataIds.includes(item)));
          break;
        case BulkSelectValue.page:
          onSelect(Array.from(new Set([...selectedIds, ...pageDataIds])));
          break;
        case BulkSelectValue.none:
        default:
          onSelect([]);
      }
    },
    [selectedIds, pageDataIds, dataIds, onSelect],
  );

  return (
    <div className="pf-v5-u-text-nowrap">
      <BulkSelect
        canSelectAll
        selectedCount={selectedIds.length}
        pageCount={pageDataIds.length}
        totalCount={dataIds.length}
        onSelect={onBulkSelect}
        {...(!isEmpty(pageDataIds) && {
          pagePartiallySelected,
          pageSelected,
        })}
      />
    </div>
  );
};

export default TableBulkSelect;
