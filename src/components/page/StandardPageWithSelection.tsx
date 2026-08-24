import { type ComponentProps, type FC, type ReactElement, useMemo, useRef } from 'react';

import DefaultSelectHeader from '@components/common/TableView/DefaultSelectHeader';
import type { GlobalActionToolbarProps } from '@components/common/utils/types';

import { withTr } from '../common/TableView/withTr';

import { usePageSelection } from './hooks/usePageSelection';
import { createHeaderWithSelection } from './utils/createHeaderWithSelection';
import { createRowWithSelection } from './utils/createRowWithSelection';
import StandardPage from './StandardPage';

const defaultCanSelect = (_item: unknown): boolean => true;

const wrapActionWithSelection = <T,>(
  Action: FC<GlobalActionToolbarProps<T>>,
  selectedIds: string[],
  actionKey: string,
): FC<GlobalActionToolbarProps<T>> => {
  const ActionWithSelection = (actionProps: ComponentProps<typeof Action>): ReactElement => (
    <Action {...actionProps} selectedIds={selectedIds} />
  );
  ActionWithSelection.displayName = `${actionKey}WithSelection`;
  return ActionWithSelection;
};

/**
 * Enforces prop combinations at compile-time via discriminated unions:
 * - Selection: requires onSelect + toId + selectedIds
 * - Expansion only: requires onExpand + toId + expandedIds
 * - Neither: all optional
 */
type StandardPageWithSelectionProps<T> = ComponentProps<typeof StandardPage<T>> &
  (
    | {
        canSelect?: (item: T) => boolean;
        expandedIds?: string[];
        getSelectDisabledReason?: (item: T) => string | undefined;
        onExpand?: (expandedIds: string[]) => void;
        // Selection enabled - all selection props required
        onSelect: (selectedIds: string[]) => void;
        selectedIds: string[];
        toId: (item: T) => string;
      }
    | {
        canSelect?: never;
        expandedIds: string[];
        getSelectDisabledReason?: never;
        onExpand: (expandedIds: string[]) => void;
        // Expansion only (no selection) - requires toId and expansion props
        onSelect?: never;
        selectedIds?: never;
        toId: (item: T) => string;
      }
    | {
        canSelect?: never;
        expandedIds?: never;
        getSelectDisabledReason?: never;
        onExpand?: never;
        // No selection or expansion - all optional
        onSelect?: never;
        selectedIds?: never;
        toId?: never;
      }
  );

export const StandardPageWithSelection = <T,>(
  props: StandardPageWithSelectionProps<T>,
): ReactElement => {
  const {
    canSelect: canSelectProp,
    cell,
    expanded,
    expandedIds,
    getSelectDisabledReason,
    GlobalActionToolbarItems,
    header,
    onExpand,
    onSelect,
    selectedIds,
    toId,
    ...rest
  } = props;
  const canSelect = canSelectProp ?? defaultCanSelect;

  const pageRef = useRef(rest.page ?? 1);

  const {
    internalExpandedIds,
    internalSelectedIds,
    isExpanded,
    onSelectCallback,
    toggleExpandFor,
    toggleSelectFor,
  } = usePageSelection({
    expandedIds,
    onExpand,
    onSelect,
    selectedIds,
    toId,
  });

  const row = useMemo(() => {
    const RowWithSelection = createRowWithSelection({
      canSelect,
      cell,
      expandedIds: internalExpandedIds,
      getSelectDisabledReason,
      selectedIds: internalSelectedIds,
      toggleExpandFor,
      toggleSelectFor,
      toId,
    });
    return withTr(RowWithSelection, expanded);
  }, [
    canSelect,
    cell,
    expanded,
    getSelectDisabledReason,
    internalExpandedIds,
    internalSelectedIds,
    toggleExpandFor,
    toggleSelectFor,
    toId,
  ]);

  const finalHeader = useMemo(() => {
    return createHeaderWithSelection({
      canSelect: Boolean(onSelect),
      header: header ?? DefaultSelectHeader,
      isExpanded,
    });
  }, [header, isExpanded, onSelect]);

  const EnhancedGlobalActionToolbarItems = useMemo(() => {
    const seen = new Map<string, number>();

    return GlobalActionToolbarItems?.map((Action: FC<GlobalActionToolbarProps<T>>) => {
      const base = Action.displayName ?? Action.name ?? 'Action';
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);
      const actionKey = occurrence === 0 ? base : `${base}__${occurrence}`;

      return wrapActionWithSelection(Action, internalSelectedIds ?? [], actionKey);
    });
  }, [GlobalActionToolbarItems, internalSelectedIds]);

  // When selection is disabled, render plain StandardPage (no checkboxes/selection logic)
  if (!onSelect) {
    const { cell: _cell, ...restWithoutCell } = props;
    return (
      <StandardPage
        {...restWithoutCell}
        expandedIds={internalExpandedIds}
        header={finalHeader}
        pageRef={pageRef}
        row={row}
      />
    );
  }

  return (
    <StandardPage
      {...rest}
      canSelect={canSelect}
      expandedIds={internalExpandedIds}
      GlobalActionToolbarItems={EnhancedGlobalActionToolbarItems}
      header={finalHeader}
      onSelect={onSelectCallback}
      pageRef={pageRef}
      row={row}
      selectedIds={internalSelectedIds}
      toId={toId}
    />
  );
};
