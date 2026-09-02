import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import { isEmpty } from '@utils/helpers';

export const BULK_SELECT_VALUE = {
  all: 'all',
  none: 'none',
  nonePage: 'nonePage',
  page: 'page',
} as const;

type BulkSelectValue = (typeof BULK_SELECT_VALUE)[keyof typeof BULK_SELECT_VALUE];

type UseTableBulkSelectArgs = {
  canPageSelect: boolean;
  dataIds: string[];
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  selectedIds: string[];
};

type UseTableBulkSelectResult = {
  allOption: BulkSelectValue;
  checkboxIsChecked: boolean | null;
  isOpen: boolean;
  onMenuSelect: (value: string | number | undefined) => void;
  onToggleCheckbox: (checked: boolean) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const useTableBulkSelect = ({
  canPageSelect,
  dataIds,
  onSelect,
  pageDataIds,
  selectedIds,
}: UseTableBulkSelectArgs): UseTableBulkSelectResult => {
  const [isOpen, setOpen] = useState(false);
  const pageSelected =
    !isEmpty(pageDataIds) && pageDataIds.every((item) => selectedIds.includes(item));
  const pagePartiallySelected =
    !isEmpty(pageDataIds) &&
    pageDataIds.some((item) => selectedIds.includes(item)) &&
    !pageSelected;
  const allOption = canPageSelect ? BULK_SELECT_VALUE.page : BULK_SELECT_VALUE.all;
  const noneOption = canPageSelect ? BULK_SELECT_VALUE.nonePage : BULK_SELECT_VALUE.none;
  const isIndeterminate =
    (canPageSelect && pagePartiallySelected) ||
    (!canPageSelect && !isEmpty(selectedIds) && selectedIds.length < dataIds.length);
  const checkboxIsChecked = isIndeterminate
    ? null
    : pageSelected || (!isEmpty(dataIds) && selectedIds.length === dataIds.length);

  const applyValue = useCallback(
    (value: string | number | undefined): void => {
      switch (value) {
        case BULK_SELECT_VALUE.all:
          onSelect(dataIds);
          break;
        case BULK_SELECT_VALUE.nonePage:
          onSelect(selectedIds.filter((item) => !pageDataIds.includes(item)));
          break;
        case BULK_SELECT_VALUE.page:
          onSelect(Array.from(new Set([...selectedIds, ...pageDataIds])));
          break;
        case BULK_SELECT_VALUE.none:
        case undefined:
        default:
          onSelect([]);
      }
    },
    [dataIds, onSelect, pageDataIds, selectedIds],
  );

  const onMenuSelect = useCallback(
    (value: string | number | undefined): void => {
      setOpen(false);
      applyValue(value);
    },
    [applyValue],
  );

  const onToggleCheckbox = useCallback(
    (checked: boolean): void => {
      applyValue(checked ? allOption : noneOption);
    },
    [allOption, applyValue, noneOption],
  );

  return {
    allOption,
    checkboxIsChecked,
    isOpen,
    onMenuSelect,
    onToggleCheckbox,
    setOpen,
  };
};
