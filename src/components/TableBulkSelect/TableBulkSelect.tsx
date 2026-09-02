import type { FC, Ref } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleCheckbox,
  type MenuToggleElement,
  Popover,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { BULK_SELECT_VALUE, useTableBulkSelect } from './hooks/useTableBulkSelect';

type TableBulkSelectProps = {
  canPageSelect?: boolean;
  dataIds: string[];
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  selectedIds: string[];
};

const TOGGLE_CHECKBOX_ID = 'bulk-select-toggle-checkbox';
const TABLE_BULK_SELECT_TEST_ID = 'table-bulk-select';

const TableBulkSelect: FC<TableBulkSelectProps> = ({
  canPageSelect = true,
  dataIds,
  onSelect,
  pageDataIds,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const { allOption, checkboxIsChecked, isOpen, onMenuSelect, onToggleCheckbox, setOpen } =
    useTableBulkSelect({
      canPageSelect,
      dataIds,
      onSelect,
      pageDataIds,
      selectedIds,
    });

  const bulkSelect = (
    <div className="pf-v6-u-text-nowrap" data-testid={TABLE_BULK_SELECT_TEST_ID}>
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setOpen}
        shouldFocusToggleOnSelect
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            aria-label={t('Bulk select toggle')}
            data-testid={`${TABLE_BULK_SELECT_TEST_ID}-toggle`}
            isExpanded={isOpen}
            onClick={() => {
              setOpen((open) => !open);
            }}
            ref={toggleRef}
            splitButtonItems={[
              <MenuToggleCheckbox
                aria-label={
                  allOption === BULK_SELECT_VALUE.page ? t('Select page') : t('Select all')
                }
                data-testid={`${TABLE_BULK_SELECT_TEST_ID}-checkbox`}
                id={TOGGLE_CHECKBOX_ID}
                isChecked={checkboxIsChecked}
                isDisabled={!canPageSelect}
                key="bulk-select-checkbox"
                onChange={onToggleCheckbox}
              />,
              isEmpty(selectedIds) ? null : (
                <span key="bulk-select-text">{`${selectedIds.length} ${t('selected')}`}</span>
              ),
            ]}
          />
        )}
      >
        <DropdownList data-testid={`${TABLE_BULK_SELECT_TEST_ID}-menu`}>
          <DropdownItem
            data-testid={`${TABLE_BULK_SELECT_TEST_ID}-select-none`}
            onClick={() => {
              onMenuSelect(BULK_SELECT_VALUE.none);
            }}
            value={BULK_SELECT_VALUE.none}
          >
            {t('Select none (0)')}
          </DropdownItem>
          {canPageSelect && (
            <DropdownItem
              data-testid={`${TABLE_BULK_SELECT_TEST_ID}-select-page`}
              onClick={() => {
                onMenuSelect(BULK_SELECT_VALUE.page);
              }}
              value={BULK_SELECT_VALUE.page}
            >
              {t('Select page ({{count}})', { count: pageDataIds.length })}
            </DropdownItem>
          )}
          <DropdownItem
            data-testid={`${TABLE_BULK_SELECT_TEST_ID}-select-all`}
            onClick={() => {
              onMenuSelect(BULK_SELECT_VALUE.all);
            }}
            value={BULK_SELECT_VALUE.all}
          >
            {t('Select all ({{count}})', { count: dataIds.length })}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );

  if (canPageSelect) {
    return bulkSelect;
  }

  return (
    <Popover
      bodyContent={t('Expand folders to show VMs on the current page, then you can select them.')}
      enableFlip
      triggerAction="hover"
    >
      {bulkSelect}
    </Popover>
  );
};

export default TableBulkSelect;
