import { type ComponentProps, type FC, type ReactElement, useMemo, useRef } from 'react';

import DefaultSelectHeader from '@components/common/TableView/DefaultSelectHeader';
import type { GlobalActionToolbarProps } from '@components/common/utils/types';

import { withTr } from '../common/TableView/withTr';

import PageSelectionProvider from './context/PageSelectionProvider';
import { usePageSelection } from './hooks/usePageSelection';
import { createHeaderWithSelection } from './utils/createHeaderWithSelection';
import { createRowWithSelection } from './utils/createRowWithSelection';
import { createToolbarActionWithSelection } from './utils/createToolbarActionWithSelection';
import { renderStandardPageWithSelectionContent } from './utils/renderStandardPageWithSelectionContent';
import type StandardPage from './StandardPage';

const defaultCanSelect = (_item: unknown): boolean => true;

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
  const canSelectRef = useRef(canSelect);
  const cellRef = useRef(cell);
  const getSelectDisabledReasonRef = useRef(getSelectDisabledReason);
  const toIdRef = useRef(toId);
  const toggleExpandForRef = useRef<(items: T[]) => void>(() => undefined);
  const toggleSelectForRef = useRef<(items: T[]) => void>(() => undefined);

  canSelectRef.current = canSelect;
  cellRef.current = cell;
  getSelectDisabledReasonRef.current = getSelectDisabledReason;
  toIdRef.current = toId;

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

  toggleExpandForRef.current = toggleExpandFor;
  toggleSelectForRef.current = toggleSelectFor;

  const selectionConfigValue = useMemo(
    () => ({
      canSelectRef,
      cellRef,
      getSelectDisabledReasonRef,
      hasExpansion: onExpand !== undefined || expandedIds !== undefined,
      hasSelection: onSelect !== undefined,
      toggleExpandForRef,
      toggleSelectForRef,
      toIdRef,
    }),
    [expandedIds, onExpand, onSelect],
  );

  const selectionStateValue = useMemo(
    () => ({
      expandedIds: internalExpandedIds,
      selectedIds: internalSelectedIds,
    }),
    [internalExpandedIds, internalSelectedIds],
  );

  const row = useMemo(() => {
    const RowWithSelection = createRowWithSelection<T>();
    return withTr(RowWithSelection, expanded);
  }, [expanded]);

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

      return createToolbarActionWithSelection(Action, actionKey);
    });
  }, [GlobalActionToolbarItems]);

  const page = renderStandardPageWithSelectionContent({
    canSelect,
    finalHeader,
    internalExpandedIds,
    internalSelectedIds,
    onSelect,
    onSelectCallback,
    pageRef,
    props,
    row,
    toId,
    toolbarItems: EnhancedGlobalActionToolbarItems,
  });

  return (
    <PageSelectionProvider configValue={selectionConfigValue} stateValue={selectionStateValue}>
      {page}
    </PageSelectionProvider>
  );
};
