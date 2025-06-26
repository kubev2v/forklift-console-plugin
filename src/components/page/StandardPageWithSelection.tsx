import { type ComponentProps, type FC, useCallback, useMemo, useRef, useState } from 'react';

import DefaultSelectHeader from '@components/common/TableView/DefaultSelectHeader';
import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import { Td, Th } from '@patternfly/react-table';

import type { RowProps, TableViewHeaderProps } from '../common/TableView/types';
import { withTr } from '../common/TableView/withTr';

import StandardPage, { type StandardPageProps } from './StandardPage';
import type {
  IdBasedSelectionProps,
  WithHeaderSelectionProps,
  WithRowSelectionProps,
} from './types';

const withRowSelection = <T,>({
  canSelect,
  CellMapper,
  isExpanded,
  isSelected,
  toggleExpandFor,
  toggleSelectFor,
}: WithRowSelectionProps<T>) => {
  const Enhanced = (props: RowProps<T>) => (
    <>
      {isExpanded && (
        <Td
          expand={{
            isExpanded: isExpanded(props.resourceData) ?? false,
            onToggle: () => {
              toggleExpandFor([props.resourceData]);
            },
            rowIndex: props.resourceIndex,
          }}
        />
      )}
      {isSelected && (
        <Td
          select={{
            isDisabled: !canSelect?.(props.resourceData),
            isSelected: isSelected(props.resourceData) ?? false,
            onSelect: () => {
              toggleSelectFor([props.resourceData]);
            },
            rowIndex: props.resourceIndex,
          }}
        />
      )}
      {CellMapper && <CellMapper {...props} />}
    </>
  );

  return Enhanced;
};

const withHeaderSelection = <T,>({ HeaderMapper, isExpanded }: WithHeaderSelectionProps<T>) => {
  const Enhanced = ({ dataOnScreen, ...other }: TableViewHeaderProps<T>) => {
    return (
      <>
        {isExpanded && <Th />}
        {HeaderMapper && <HeaderMapper {...{ ...other, dataOnScreen }} />}
      </>
    );
  };

  return Enhanced;
};

/**
 * Adds ID based multi selection to StandardPage component.
 * Contract:
 * 1. IDs provided with toId() function are unique and constant in time
 * 2. check box status at row level does not depend from other rows and  can be calculated from the item via canSelect() function
 */
const withIdBasedSelection = <T,>({
  canSelect,
  expandedIds: initialExpandedIds,
  onExpand,
  onSelect,
  selectedIds: initialSelectedIds,
  toId,
}: IdBasedSelectionProps<T>) => {
  const Enhanced = (props: StandardPageProps<T>) => {
    const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
    const [expandedIds, setExpandedIds] = useState(initialExpandedIds);
    const itemToId = useCallback((item: T) => (toId ? toId(item) : ''), []);

    const isSelected = useMemo(
      () =>
        onSelect || selectedIds ? (item: T) => selectedIds?.includes(itemToId(item)) : undefined,
      [selectedIds, itemToId],
    );
    const isExpanded = useMemo(
      () =>
        onExpand || expandedIds ? (item: T) => expandedIds?.includes(itemToId(item)) : undefined,
      [expandedIds, itemToId],
    );

    const toggleSelectFor = useCallback(
      (items: T[]) => {
        const ids = items.map(itemToId);
        const allSelected = ids.every((id) => selectedIds?.includes(id));
        const newSelectedIds = [
          ...(selectedIds ?? []).filter((it) => !ids.includes(it)),
          ...(allSelected ? [] : ids),
        ];

        setSelectedIds(newSelectedIds);

        if (onSelect) {
          onSelect(newSelectedIds);
        }
      },
      [selectedIds, itemToId],
    );

    const toggleExpandFor = useCallback(
      (items: T[]) => {
        const ids = items.map(itemToId);
        const allExpanded = ids.every((id) => expandedIds?.includes(id));
        const newExpandedIds = [
          ...(expandedIds ?? []).filter((it) => !ids.includes(it)),
          ...(allExpanded ? [] : ids),
        ];

        setExpandedIds(newExpandedIds);
        if (onExpand) {
          onExpand(newExpandedIds);
        }
      },
      [itemToId, expandedIds],
    );

    const { CellMapper, ExpandedComponent, ...rest } = props;

    const RowMapper = useMemo(
      () =>
        withTr(
          withRowSelection({
            canSelect,
            CellMapper,
            isExpanded,
            isSelected,
            toggleExpandFor,
            toggleSelectFor,
          }),
          ExpandedComponent,
        ),
      [ExpandedComponent, toggleExpandFor, toggleSelectFor, isExpanded, isSelected, CellMapper],
    );

    const HeaderMapper = useMemo(
      () =>
        withHeaderSelection({
          HeaderMapper: props.HeaderMapper ?? DefaultSelectHeader,
          isExpanded,
        }),
      [props.HeaderMapper, isExpanded],
    );

    const onSelectCallback = useCallback((ids: string[]) => {
      setSelectedIds(ids);
      onSelect?.(ids);
    }, []);

    return (
      <StandardPage
        {...rest}
        expandedIds={expandedIds}
        selectedIds={selectedIds}
        onSelect={onSelectCallback}
        toId={toId}
        RowMapper={RowMapper}
        HeaderMapper={HeaderMapper}
        GlobalActionToolbarItems={props.GlobalActionToolbarItems?.map(
          (Action: FC<GlobalActionToolbarProps<T>>) => {
            const ActionWithSelection = (actionProps: ComponentProps<typeof Action>) => (
              <Action {...actionProps} selectedIds={selectedIds} />
            );
            ActionWithSelection.displayName = `${Action.displayName ?? 'Action'}WithSelection`;

            return ActionWithSelection;
          },
        )}
      />
    );
  };
  Enhanced.displayName = 'StandardPageWithSelection';
  return Enhanced;
};

/**
 * Properties for the `StandardPageWithSelection` component.
 * These properties extend the base `StandardPageProps` and add additional ones related to selection.
 *
 * @typedef {Object} StandardPageWithSelectionProps
 * @property {Function} toId - A function that returns a unique identifier for each item.
 * @property {Function} canSelect - A function that determines whether an item can be selected.
 * @property {Function} onSelect - A callback function that is triggered when the selection changes.
 * @property {string[]} selectedIds - An array of identifiers for the currently selected items.
 * @property {Function} onExpand - A callback function that is triggered when row is expanded or un expanded.
 * @property {string[]} expandedIds - An array of identifiers for the currently expanded items.
 * @property {...StandardPageProps<T>} - Other props that are passed through to the `StandardPage` component.
 *
 * @template T - The type of the items being displayed in the table.
 */
type StandardPageWithSelectionProps<T> = {
  toId?: (item: T) => string;
  canSelect?: (item: T) => boolean;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  onExpand?: (expandedIds: string[]) => void;
  expandedIds?: string[];
} & StandardPageProps<T>;

/**
 * Renders a standard page with selection capabilities.
 * This component wraps the `StandardPage` component and adds support for row selection.
 * It uses the provided `toId`, `canSelect`, `onSelect`, and `selectedIds` props to manage the selection state.
 *
 * NOTE: if `onSelect` is missing, the component will return `StandardPage` without selections.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.toId - A function that returns a unique identifier for each item.
 * @param {Function} props.canSelect - A function that determines whether an item can be selected.
 * @param {Function} props.onSelect - A callback function that is triggered when the selection changes.
 * @param {string[]} props.selectedIds - An array of identifiers for the currently selected items.
 * @param {...StandardPageProps<T>} props - Other props that are passed through to the `StandardPage` component.
 *
 * @template T - The type of the items being displayed in the table.
 *
 * @example
 * <StandardPageWithSelection
 *   toId={item => item.id}
 *   canSelect={item => item.status !== 'archived'}
 *   onSelect={selectedIds => console.log('Selected IDs:', selectedIds)}
 *   selectedIds={['1', '2']}
 * />
 */
export const StandardPageWithSelection = <T,>(props: StandardPageWithSelectionProps<T>) => {
  const {
    canSelect = () => true,
    expandedIds,
    onExpand,
    onSelect,
    selectedIds,
    toId,
    ...rest
  } = props;
  const pageRef = useRef(rest.page);

  if (onSelect && (!toId || !selectedIds)) {
    throw new Error('Missing required properties: toId, selectedIds');
  }

  if (onExpand && (!toId || !expandedIds)) {
    throw new Error('Missing required properties: toId, expandedIds');
  }

  const EnhancedStandardPage = useMemo(
    () =>
      withIdBasedSelection<T>({
        canSelect,
        expandedIds,
        onExpand,
        onSelect,
        selectedIds,
        toId,
      }),
    [canSelect, expandedIds, onExpand, onSelect, selectedIds, toId],
  );

  return onSelect ? (
    <EnhancedStandardPage onSelect={onSelect} {...rest} pageRef={pageRef} />
  ) : (
    <StandardPage {...rest} pageRef={pageRef} />
  );
};
