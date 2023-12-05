import React, { useState } from 'react';

import {
  DefaultHeader,
  GlobalActionToolbarProps,
  RowProps,
  TableViewHeaderProps,
} from '@kubev2v/common';
import { Th } from '@patternfly/react-table';

import StandardPage, { StandardPageProps } from './StandardPage';

export function withRowSelection<T>({ RowMapper, isSelected, toggleSelectFor }) {
  const Enhanced = (props: RowProps<T>) => (
    <RowMapper
      {...props}
      isSelected={isSelected(props.resourceData)}
      // the check box will be always visible
      // with current interface disabling/hiding needs to be implemented at the row mapper level
      toggleSelect={() => toggleSelectFor([props.resourceData])}
    />
  );
  Enhanced.displayName = `${RowMapper.displayName || 'RowMapper'}WithSelection`;
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
   * global toolbar actions
   */
  actions: React.FC<GlobalActionToolbarProps<T> & { selectedIds: string[] }>[];
}

/**
 * Adds ID based multi selection to StandardPage component.
 * Contract:
 * 1. provided row mapper renders check boxes when needed
 * 2. IDs provided with toId() function are unique and constant in time
 * 3. check box status at row level does not depend from other rows and  can be calculated from the item via canSelect() function
 */
export function withIdBasedSelection<T>({ toId, canSelect, actions }: IdBasedSelectionProps<T>) {
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
        RowMapper={withRowSelection({
          RowMapper: props.RowMapper,
          isSelected,
          toggleSelectFor,
        })}
        HeaderMapper={withHeaderSelection({
          HeaderMapper: props.HeaderMapper ?? DefaultHeader,
          canSelect,
          isSelected,
          toggleSelectFor,
        })}
        GlobalActionToolbarItems={actions.map((Action) => {
          const ActionWithSelection = (props) => <Action {...{ ...props, selectedIds }} />;
          ActionWithSelection.displayName = `${Action.displayName || 'Action'}WithSelection`;
          return ActionWithSelection;
        })}
      />
    );
  };
  Enhanced.displayName = 'StandardPageWithSelection';
  return Enhanced;
}
