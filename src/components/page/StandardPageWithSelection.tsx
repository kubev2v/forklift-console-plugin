import type { ComponentProps, FC } from 'react';
import { useMemo, useRef } from 'react';

import DefaultSelectHeader from '@components/common/TableView/DefaultSelectHeader';
import type { GlobalActionToolbarProps } from '@components/common/utils/types';

import { withTr } from '../common/TableView/withTr';

import { usePageSelection } from './hooks/usePageSelection';
import { createHeaderWithSelection } from './utils/createHeaderWithSelection';
import { createRowWithSelection } from './utils/createRowWithSelection';
import StandardPage from './StandardPage';

/**
 * Enforces prop combinations at compile-time via discriminated unions:
 * - Selection: requires onSelect + toId + selectedIds
 * - Expansion only: requires onExpand + toId + expandedIds
 * - Neither: all optional
 */
type StandardPageWithSelectionProps<T> = ComponentProps<typeof StandardPage<T>> &
  (
    | {
        // Selection enabled - all selection props required
        onSelect: (selectedIds: string[]) => void;
        toId: (item: T) => string;
        selectedIds: string[];
        canSelect?: (item: T) => boolean;
        onExpand?: (expandedIds: string[]) => void;
        expandedIds?: string[];
      }
    | {
        // Expansion only (no selection) - requires toId and expansion props
        onSelect?: never;
        toId: (item: T) => string;
        selectedIds?: never;
        canSelect?: never;
        onExpand: (expandedIds: string[]) => void;
        expandedIds: string[];
      }
    | {
        // No selection or expansion - all optional
        onSelect?: never;
        toId?: never;
        selectedIds?: never;
        canSelect?: never;
        onExpand?: never;
        expandedIds?: never;
      }
  );

export const StandardPageWithSelection = <T,>(props: StandardPageWithSelectionProps<T>) => {
  const {
    canSelect = () => true,
    cell,
    expanded,
    expandedIds,
    GlobalActionToolbarItems,
    header,
    onExpand,
    onSelect,
    selectedIds,
    toId,
    ...rest
  } = props;

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
      selectedIds: internalSelectedIds,
      toggleExpandFor,
      toggleSelectFor,
      toId,
    });
    return withTr(RowWithSelection, expanded);
  }, [
    cell,
    expanded,
    internalExpandedIds,
    internalSelectedIds,
    toggleExpandFor,
    toggleSelectFor,
    toId,
    canSelect,
  ]);

  const finalHeader = useMemo(
    () =>
      createHeaderWithSelection({
        header: header ?? DefaultSelectHeader,
        isExpanded,
      }),
    [header, isExpanded],
  );

  const EnhancedGlobalActionToolbarItems = useMemo(
    () =>
      GlobalActionToolbarItems?.map((Action: FC<GlobalActionToolbarProps<T>>) => {
        const ActionWithSelection = (actionProps: ComponentProps<typeof Action>) => (
          <Action {...actionProps} selectedIds={internalSelectedIds} />
        );
        ActionWithSelection.displayName = `${Action.displayName ?? 'Action'}WithSelection`;
        return ActionWithSelection;
      }),
    [GlobalActionToolbarItems, internalSelectedIds],
  );

  // When selection is disabled, render plain StandardPage (no checkboxes/selection logic)
  if (!onSelect) {
    return <StandardPage {...rest} pageRef={pageRef} />;
  }

  return (
    <StandardPage
      {...rest}
      pageRef={pageRef}
      expandedIds={internalExpandedIds}
      selectedIds={internalSelectedIds}
      onSelect={onSelectCallback}
      toId={toId}
      row={row}
      header={finalHeader}
      GlobalActionToolbarItems={EnhancedGlobalActionToolbarItems}
    />
  );
};
