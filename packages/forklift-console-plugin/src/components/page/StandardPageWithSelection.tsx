import React, { FC } from 'react';

import {
  DefaultHeader,
  GlobalActionToolbarProps,
  RowProps,
  TableViewHeaderProps,
} from '@kubev2v/common';
import { Td, Th } from '@patternfly/react-table';

import StandardPage, { StandardPageProps } from './StandardPage';

export function withRowSelection<T>({ CellMapper, isSelected, toggleSelectFor, canSelect }) {
  const Enhanced = (props: RowProps<T>) => (
    <>
      <Td
        select={{
          rowIndex: props.resourceIndex,
          onSelect: () => toggleSelectFor([props.resourceData]),
          isSelected: isSelected(props.resourceData),
          disable: !canSelect(props.resourceData),
        }}
      />
      <CellMapper {...props} />
    </>
  );
  Enhanced.displayName = `${CellMapper.displayName || 'CellMapper'}WithSelection`;
  return Enhanced;
}

export function withHeaderSelection<T>({ HeaderMapper, isSelected, canSelect, toggleSelectFor }) {
  const Enhanced = ({ dataOnScreen, ...other }: TableViewHeaderProps<T>) => {
    const selectableItems = dataOnScreen.filter(canSelect);
    const allSelected = selectableItems.every((it) => isSelected(it));
    return (
      <>
        <Th
          select={{
            onSelect: () => toggleSelectFor(selectableItems),
            isSelected: allSelected,
            isHeaderSelectDisabled: !selectableItems?.length, // Disable if no selectable items
          }}
        />
        <HeaderMapper {...{ ...other, dataOnScreen }} />
      </>
    );
  };
  Enhanced.displayName = `${HeaderMapper.displayName || 'HeaderMapper'}WithSelection`;
  return Enhanced;
}

export interface IdBasedSelectionProps<T> {
  /**
   * @returns string that can be used as an unique identifier
   */
  toId: (item: T) => string;

  /**
   * @returns true if items can be selected, false otherwise
   */
  canSelect: (item: T) => boolean;

  /**
   * onSelect is called when selection changes
   */
  onSelect: (selectedIds: string[]) => void;

  /**
   * Selected ids
   */
  selectedIds: string[];
}

export type GlobalActionWithSelection<T> = GlobalActionToolbarProps<T> & {
  selectedIds: string[];
};

/**
 * Adds ID based multi selection to StandardPage component.
 * Contract:
 * 1. IDs provided with toId() function are unique and constant in time
 * 2. check box status at row level does not depend from other rows and  can be calculated from the item via canSelect() function
 */
export function withIdBasedSelection<T>({
  toId,
  canSelect,
  onSelect,
  selectedIds,
}: IdBasedSelectionProps<T>) {
  const Enhanced = (props: StandardPageProps<T>) => {
    const isSelected = (item: T) => selectedIds.includes(toId(item));

    const toggleSelectFor = (items: T[]) => {
      const ids = items.map(toId);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      const newSelectedIds = [
        ...selectedIds.filter((it) => !ids.includes(it)),
        ...(allSelected ? [] : ids),
      ];

      onSelect(newSelectedIds);
    };

    return (
      <StandardPage
        {...props}
        CellMapper={withRowSelection({
          CellMapper: props.CellMapper,
          canSelect,
          isSelected,
          toggleSelectFor,
        })}
        HeaderMapper={withHeaderSelection({
          HeaderMapper: props.HeaderMapper ?? DefaultHeader,
          canSelect,
          isSelected,
          toggleSelectFor,
        })}
        GlobalActionToolbarItems={props.GlobalActionToolbarItems?.map(
          (Action: FC<GlobalActionWithSelection<T>>) => {
            const ActionWithSelection = (props) => <Action {...{ ...props, selectedIds }} />;
            ActionWithSelection.displayName = `${Action.displayName || 'Action'}WithSelection`;
            return ActionWithSelection;
          },
        )}
      />
    );
  };
  Enhanced.displayName = 'StandardPageWithSelection';
  return Enhanced;
}

/**
 * Properties for the `StandardPageWithSelection` component.
 * These properties extend the base `StandardPageProps` and add additional ones related to selection.
 *
 * @typedef {Object} StandardPageWithSelectionProps
 * @property {Function} toId - A function that returns a unique identifier for each item.
 * @property {Function} canSelect - A function that determines whether an item can be selected.
 * @property {Function} onSelect - A callback function that is triggered when the selection changes.
 * @property {string[]} selectedIds - An array of identifiers for the currently selected items.
 * @property {...StandardPageProps<T>} - Other props that are passed through to the `StandardPage` component.
 *
 * @template T - The type of the items being displayed in the table.
 */
export interface StandardPageWithSelectionProps<T> extends StandardPageProps<T> {
  toId?: (item: T) => string;
  canSelect?: (item: T) => boolean;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
}

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
 *   // ...other props
 * />
 */
export function StandardPageWithSelection<T>(props: StandardPageWithSelectionProps<T>) {
  const { toId, canSelect = () => true, onSelect, selectedIds, ...rest } = props;

  if (onSelect && (!toId || !selectedIds)) {
    throw new Error('Missing required properties: toId, selectedIds');
  }

  const EnhancedStandardPage = withIdBasedSelection<T>({
    toId,
    canSelect,
    onSelect,
    selectedIds,
  });

  return onSelect ? <EnhancedStandardPage {...rest} /> : <StandardPage {...rest} />;
}
