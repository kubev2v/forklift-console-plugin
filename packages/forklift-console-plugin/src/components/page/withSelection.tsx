import React, { FC, useState } from 'react';

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
export function withIdBasedSelection<T>({ toId, canSelect }: IdBasedSelectionProps<T>) {
  const Enhanced = (props: StandardPageProps<T>) => {
    const [selectedIds, setSelectedIds]: [string[], (selected: string[]) => void] = useState([]);
    const isSelected = (item: T) => selectedIds.includes(toId(item));
    const toggleSelectFor = (items: T[]) => {
      const ids = items.map(toId);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      setSelectedIds([
        ...selectedIds.filter((it) => !ids.includes(it)),
        ...(allSelected ? [] : ids),
      ]);
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
