import React, { useState } from 'react';

import { RowProps, withTr } from '@kubev2v/common';
import { Td, Th } from '@patternfly/react-table';

import StandardPage, { StandardPageProps } from './StandardPage';

export function withRowExpansion<T>({ CellMapper, isExpanded, toggleExpandFor }) {
  const Enhanced = (props: RowProps<T>) => (
    <>
      {isExpanded && (
        <Td
          expand={{
            rowIndex: props.resourceIndex,
            isExpanded: isExpanded(props.resourceData),
            onToggle: () => toggleExpandFor([props.resourceData]),
          }}
        />
      )}
      <CellMapper {...props} />
    </>
  );
  Enhanced.displayName = `${CellMapper.displayName || 'CellMapper'}WithExpansion`;
  return Enhanced;
}

export interface IdBasedExpansionProps<T> {
  /**
   * @returns string that can be used as an unique identifier
   */
  toId?: (item: T) => string;

  /**
   * onExpand is called when expand changes
   */
  onExpand?: (expandedIds: string[]) => void;

  /**
   * Expanded ids
   */
  expandedIds?: string[];
}

/**
 * Adds ID based expansion to StandardPage component.
 * Contract:
 * 1. IDs provided with toId() function are unique and constant in time
 */
export function withIdBasedExpansion<T>({
  toId,
  onExpand,
  expandedIds: initialExpandedIds,
}: IdBasedExpansionProps<T>) {
  const Enhanced = (props: StandardPageProps<T>) => {
    const [expandedIds, setExpandedIds] = useState(initialExpandedIds);

    const isExpanded =
      onExpand || expandedIds ? (item: T) => expandedIds.includes(toId(item)) : undefined;

    const toggleExpandFor = (items: T[]) => {
      const ids = items.map(toId);
      const allExpanded = ids.every((id) => expandedIds?.includes(id));
      const newExpandedIds = [
        ...(expandedIds || []).filter((it) => !ids.includes(it)),
        ...(allExpanded ? [] : ids),
      ];

      setExpandedIds(newExpandedIds);
      if (onExpand) {
        onExpand(newExpandedIds);
      }
    };

    const { CellMapper, ExpandedComponent, ...rest } = props;

    const RowMapper = withTr(
      withRowExpansion({
        CellMapper: CellMapper,
        isExpanded,
        toggleExpandFor,
      }),
      ExpandedComponent,
    );

    return (
      <StandardPage
        {...rest}
        expandedIds={expandedIds}
        toId={toId}
        RowMapper={RowMapper}
        HeaderMapper={() => <Th />}
        GlobalActionToolbarItems={props.GlobalActionToolbarItems}
      />
    );
  };
  Enhanced.displayName = 'StandardPageWithExpansion';
  return Enhanced;
}

/**
 * Properties for the `StandardPageWithExpansion` component.
 * These properties extend the base `StandardPageProps` and add additional ones related to expansion.
 *
 * @typedef {Object} StandardPageWithExpansionProps
 * @property {Function} toId - A function that returns a unique identifier for each item.
 * @property {Function} onExpand - A callback function that is triggered when row is expanded or un expanded.
 * @property {string[]} expandedIds - An array of identifiers for the currently expanded items.
 * @property {...StandardPageProps<T>} - Other props that are passed through to the `StandardPage` component.
 *
 * @template T - The type of the items being displayed in the table.
 */
export interface StandardPageWithExpansionProps<T> extends StandardPageProps<T> {
  toId?: (item: T) => string;
  onExpand?: (expandedIds: string[]) => void;
  expandedIds?: string[];
}

/**
 * Renders a standard page with expansion capabilities.
 * This component wraps the `StandardPage` component and adds support for row expansion.
 * It uses the provided `toId`, `onExpand`, and `expandedIds` props to manage the expansion state.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.toId - A function that returns a unique identifier for each item.
 * @param {...StandardPageProps<T>} props - Other props that are passed through to the `StandardPage` component.
 *
 * @template T - The type of the items being displayed in the table.
 *
 * @example
 * <StandardPageWithExpansion
 *   toId={item => item.id}
 *   // ...other props
 * />
 */
export function StandardPageWithExpansion<T>(props: StandardPageWithExpansionProps<T>) {
  const { toId, onExpand, expandedIds, ...rest } = props;

  if (onExpand && (!toId || !expandedIds)) {
    throw new Error('Missing required properties: toId, expandedIds');
  }

  const EnhancedStandardPage = withIdBasedExpansion<T>({
    toId,
    onExpand,
    expandedIds,
  });

  return <EnhancedStandardPage {...rest} />;
}
