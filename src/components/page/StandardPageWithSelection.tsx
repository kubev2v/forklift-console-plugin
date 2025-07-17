import {
  type ComponentProps,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  expandedIds,
  selectedIds,
  toggleExpandFor,
  toggleSelectFor,
  toId,
}: WithRowSelectionProps<T> & {
  selectedIds?: string[];
  expandedIds?: string[];
  toId?: (item: T) => string;
}) => {
  const Enhanced = (props: RowProps<T>) => {
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
        {CellMapper && <CellMapper {...props} />}
      </>
    );
  };

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
  canSelect: initialCanSelect,
  expandedIds: initialExpandedIds,
  onExpand: initialOnExpand,
  onSelect: initialOnSelect,
  selectedIds: initialSelectedIds,
  toId: initialToId,
}: IdBasedSelectionProps<T>) => {
  const Enhanced = (
    props: StandardPageProps<T> & {
      selectedIds?: string[];
      expandedIds?: string[];
      onSelect?: (selectedIds: string[]) => void;
      onExpand?: (expandedIds: string[]) => void;
      canSelect?: (item: T) => boolean;
      toId?: (item: T) => string;
    },
  ) => {
    const selectedIds = props.selectedIds ?? initialSelectedIds;
    const expandedIds = props.expandedIds ?? initialExpandedIds;
    const onSelect = props.onSelect ?? initialOnSelect;
    const onExpand = props.onExpand ?? initialOnExpand;
    const canSelect = props.canSelect ?? initialCanSelect;
    const toId = props.toId ?? initialToId;

    const [internalSelectedIds, setInternalSelectedIds] = useState(selectedIds);
    const [internalExpandedIds, setInternalExpandedIds] = useState(expandedIds);
    const itemToId = useCallback((item: T) => (toId ? toId(item) : ''), [toId]);

    useEffect(() => {
      setInternalSelectedIds(selectedIds);
    }, [selectedIds]);

    useEffect(() => {
      setInternalExpandedIds(expandedIds);
    }, [expandedIds]);

    const isExpanded = useMemo(
      () =>
        onExpand || internalExpandedIds
          ? (item: T) => internalExpandedIds?.includes(itemToId(item))
          : undefined,
      [onExpand, internalExpandedIds, itemToId],
    );

    const toggleSelectFor = useCallback(
      (items: T[]) => {
        const ids = items.map(itemToId);
        const allSelected = ids.every((id) => internalSelectedIds?.includes(id));
        const newSelectedIds = [
          ...(internalSelectedIds ?? []).filter((it) => !ids.includes(it)),
          ...(allSelected ? [] : ids),
        ];

        setInternalSelectedIds(newSelectedIds);

        if (onSelect) {
          onSelect(newSelectedIds);
        }
      },
      [itemToId, internalSelectedIds, onSelect],
    );

    const toggleExpandFor = useCallback(
      (items: T[]) => {
        const ids = items.map(itemToId);
        const allExpanded = ids.every((id) => internalExpandedIds?.includes(id));
        const newExpandedIds = [
          ...(internalExpandedIds ?? []).filter((it) => !ids.includes(it)),
          ...(allExpanded ? [] : ids),
        ];

        setInternalExpandedIds(newExpandedIds);
        if (onExpand) {
          onExpand(newExpandedIds);
        }
      },
      [itemToId, internalExpandedIds, onExpand],
    );

    const { CellMapper, ExpandedComponent, ...rest } = props;

    const RowMapper = useMemo(() => {
      return withTr(
        withRowSelection({
          canSelect,
          CellMapper,
          expandedIds: internalExpandedIds,
          selectedIds: internalSelectedIds,
          toggleExpandFor,
          toggleSelectFor,
          toId,
        }),
        ExpandedComponent,
      );
    }, [
      ExpandedComponent,
      CellMapper,
      toggleExpandFor,
      toggleSelectFor,
      internalSelectedIds,
      internalExpandedIds,
      canSelect,
      toId,
    ]);

    const HeaderMapper = useMemo(
      () =>
        withHeaderSelection({
          HeaderMapper: props.HeaderMapper ?? DefaultSelectHeader,
          isExpanded,
        }),
      [props.HeaderMapper, isExpanded],
    );

    const onSelectCallback = useCallback(
      (ids: string[]) => {
        setInternalSelectedIds(ids);
        onSelect?.(ids);
      },
      [onSelect],
    );

    return (
      <StandardPage
        {...rest}
        expandedIds={internalExpandedIds}
        selectedIds={internalSelectedIds}
        onSelect={onSelectCallback}
        toId={toId}
        RowMapper={RowMapper}
        HeaderMapper={HeaderMapper}
        GlobalActionToolbarItems={props.GlobalActionToolbarItems?.map(
          (Action: FC<GlobalActionToolbarProps<T>>) => {
            const ActionWithSelection = (actionProps: ComponentProps<typeof Action>) => (
              <Action {...actionProps} selectedIds={internalSelectedIds} />
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

  const EnhancedStandardPage = useMemo(() => {
    return withIdBasedSelection<T>({
      canSelect: undefined,
      expandedIds: undefined,
      onExpand: undefined,
      onSelect: undefined,
      selectedIds: undefined,
      toId: undefined,
    });
  }, []);

  return onSelect ? (
    <EnhancedStandardPage
      {...rest}
      pageRef={pageRef}
      selectedIds={selectedIds}
      expandedIds={expandedIds}
      onSelect={onSelect}
      onExpand={onExpand}
      canSelect={canSelect}
      toId={toId}
    />
  ) : (
    <StandardPage {...rest} pageRef={pageRef} />
  );
};
