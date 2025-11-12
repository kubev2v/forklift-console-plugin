import type { FC } from 'react';

import { Td } from '@patternfly/react-table';

import type { RowProps } from '../../common/TableView/types';

/** Injects expand/select <Td> elements before cell content. */
export const createRowWithSelection = <T,>({
  canSelect,
  cell: CellComponent,
  expandedIds,
  selectedIds,
  toggleExpandFor,
  toggleSelectFor,
  toId,
}: {
  cell?: FC<RowProps<T>>;
  expandedIds?: string[];
  selectedIds?: string[];
  toggleExpandFor: (items: T[]) => void;
  toggleSelectFor: (items: T[]) => void;
  toId?: (item: T) => string;
  canSelect?: (item: T) => boolean;
}) => {
  const RowWithSelection = (props: RowProps<T>) => {
    const itemId = toId?.(props.resourceData) ?? '';
    const isExpanded = expandedIds?.includes(itemId) ?? false;
    const isSelected = selectedIds?.includes(itemId) ?? false;

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
            select={{
              isDisabled: !canSelect?.(props.resourceData),
              isSelected,
              onSelect: () => {
                toggleSelectFor([props.resourceData]);
              },
              rowIndex: props.resourceIndex,
            }}
          />
        )}
        {CellComponent && <CellComponent {...props} />}
      </>
    );
  };

  return RowWithSelection;
};
