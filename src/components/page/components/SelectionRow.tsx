import { type FC, memo, type ReactElement, useRef } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import { Tooltip } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';

import { usePageSelectionConfig, usePageSelectionState } from '../context/usePageSelectionContext';

type SelectCheckboxTdProps<T> = Pick<RowProps<T>, 'resourceData' | 'resourceIndex'>;

const SelectCheckboxTd = <T,>({
  resourceData,
  resourceIndex,
}: SelectCheckboxTdProps<T>): ReactElement | null => {
  const { canSelectRef, getSelectDisabledReasonRef, toggleSelectForRef, toIdRef } =
    usePageSelectionConfig<T>();
  const { selectedIds } = usePageSelectionState();
  const selectRef = useRef<HTMLTableCellElement>(null);
  const itemId = toIdRef.current?.(resourceData) ?? '';
  const isSelected = selectedIds?.includes(itemId) ?? false;
  const isDisabled = !(canSelectRef.current?.(resourceData) ?? true);
  const disabledReason = isDisabled
    ? getSelectDisabledReasonRef.current?.(resourceData)
    : undefined;

  return (
    <>
      <Td
        data-testid="row-select-checkbox"
        ref={selectRef}
        select={{
          isDisabled,
          isSelected,
          onSelect: () => {
            toggleSelectForRef.current([resourceData]);
          },
          rowIndex: resourceIndex,
        }}
      />
      {disabledReason && <Tooltip content={disabledReason} triggerRef={selectRef} />}
    </>
  );
};

type ExpandToggleTdProps<T> = Pick<RowProps<T>, 'resourceData' | 'resourceIndex'>;

const ExpandToggleTd = <T,>({
  resourceData,
  resourceIndex,
}: ExpandToggleTdProps<T>): ReactElement => {
  const { toggleExpandForRef, toIdRef } = usePageSelectionConfig<T>();
  const { expandedIds } = usePageSelectionState();
  const itemId = toIdRef.current?.(resourceData) ?? '';
  const isExpanded = expandedIds?.includes(itemId) ?? false;

  return (
    <Td
      expand={{
        isExpanded,
        onToggle: () => {
          toggleExpandForRef.current([resourceData]);
        },
        rowIndex: resourceIndex,
      }}
    />
  );
};

type SelectionRowCellProps<T> = RowProps<T> & {
  CellComponent: FC<RowProps<T>>;
};

const SelectionRowCell = memo(
  <T,>({ CellComponent, ...props }: SelectionRowCellProps<T>): ReactElement => (
    <CellComponent {...props} />
  ),
) as <T>(props: SelectionRowCellProps<T>) => ReactElement;

/** Stable row component; only checkbox/expand cells subscribe to selection state. */
const SelectionRow = <T,>(props: RowProps<T>): ReactElement => {
  const { cellRef, hasExpansion, hasSelection } = usePageSelectionConfig<T>();
  const CellComponent = cellRef.current;

  return (
    <>
      {hasExpansion && (
        <ExpandToggleTd resourceData={props.resourceData} resourceIndex={props.resourceIndex} />
      )}
      {hasSelection && (
        <SelectCheckboxTd resourceData={props.resourceData} resourceIndex={props.resourceIndex} />
      )}
      {CellComponent && <SelectionRowCell CellComponent={CellComponent} {...props} />}
    </>
  );
};

export default SelectionRow;
