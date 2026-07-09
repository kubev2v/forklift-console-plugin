import type { FC } from 'react';

import { Tooltip } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

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
    const isDisabled = !canSelect?.(props.resourceData);
    const disabledReason = isDisabled ? getSelectDisabledReason?.(props.resourceData) : undefined;

    const selectTd = isEmpty(selectedIds) ? undefined : (
      <Td
        select={{
          isDisabled,
          isSelected,
          onSelect: () => {
            toggleSelectFor([props.resourceData]);
          },
          rowIndex: props.resourceIndex,
        }}
      />
    );

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
        {selectTd &&
          (disabledReason ? <Tooltip content={disabledReason}>{selectTd}</Tooltip> : selectTd)}
        {CellComponent && <CellComponent {...props} />}
      </>
    );
  };

  return RowWithSelection;
};
