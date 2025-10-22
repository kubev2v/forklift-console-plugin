import { type FC, useCallback } from 'react';

import { BulkSelect, BulkSelectValue } from '@patternfly/react-component-groups';
import { Popover } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type TableBulkSelectProps = {
  selectedIds: string[];
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  dataIds: string[];
  canPageSelect?: boolean;
};

const TOGGLE_CHECKBOX_ID = 'bulk-select-toggle-checkbox';

const TableBulkSelect: FC<TableBulkSelectProps> = ({
  canPageSelect = true,
  dataIds = [],
  onSelect,
  pageDataIds = [],
  selectedIds = [],
}) => {
  const { t } = useForkliftTranslation();
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

  const bulkSelect = (
    <div className="pf-v6-u-text-nowrap">
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
        isDataPaginated={canPageSelect}
        menuToggleCheckboxProps={{
          id: TOGGLE_CHECKBOX_ID,
          isDisabled: !canPageSelect,
        }}
      />
    </div>
  );

  if (canPageSelect) return bulkSelect;

  return (
    <Popover
      triggerAction="hover"
      enableFlip
      bodyContent={t('Expand folders to show VMs on the current page, then you can select them.')}
    >
      {bulkSelect}
    </Popover>
  );
};

export default TableBulkSelect;
