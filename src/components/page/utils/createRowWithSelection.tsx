import { type FC, useRef } from 'react';

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
}) => {
  const RowWithSelection = (props: RowProps<T>) => {
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
        {disabledReason && <Tooltip triggerRef={selectRef} content={disabledReason} />}
        {CellComponent && <CellComponent {...props} />}
      </>
    );
  };

  return RowWithSelection;
};
