import { type FC, type ReactElement, useRef } from 'react';

import { Tooltip } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';

import type { RowProps } from '../../common/TableView/types';

/** Injects expand/select <Td> elements before cell content. */
export const createRowWithSelection = <T,>({
  canSelect,
  cell: CellComponent,
  expandedIds,
  getSelectDisabledReason,
  selectedIds,
  toggleExpandFor,
  toggleSelectFor,
  toId,
}: {
  canSelect?: (item: T) => boolean;
  cell?: FC<RowProps<T>>;
  expandedIds?: string[];
  getSelectDisabledReason?: (item: T) => string | undefined;
  selectedIds?: string[];
  toggleExpandFor: (items: T[]) => void;
  toggleSelectFor: (items: T[]) => void;
  toId?: (item: T) => string;
}): FC<RowProps<T>> => {
  const RowWithSelection = (props: RowProps<T>): ReactElement => {
    const itemId = toId?.(props.resourceData) ?? '';
    const isExpanded = expandedIds?.includes(itemId) ?? false;
    const isSelected = selectedIds?.includes(itemId) ?? false;
    const isDisabled = !(canSelect?.(props.resourceData) ?? true);
    const disabledReason = isDisabled ? getSelectDisabledReason?.(props.resourceData) : undefined;
    const selectRef = useRef<HTMLTableCellElement>(null);

    return (
      <>
        {expandedIds !== undefined && (
          <Td
            expand={{
              isExpanded,
              onToggle: () => {
                toggleExpandFor([props.resourceData]);
              },
              rowIndex: props.resourceIndex,
            }}
          />
        )}
        {selectedIds !== undefined && (
          <Td
            data-testid="row-select-checkbox"
            ref={selectRef}
            select={{
              isDisabled,
              isSelected,
              onSelect: () => {
                toggleSelectFor([props.resourceData]);
              },
              rowIndex: props.resourceIndex,
            }}
          />
        )}
        {disabledReason && <Tooltip content={disabledReason} triggerRef={selectRef} />}
        {CellComponent && <CellComponent {...props} />}
      </>
    );
  };

  return RowWithSelection;
};
