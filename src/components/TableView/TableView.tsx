import React, { ReactNode } from 'react';
import { UID } from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { Bullseye } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Field, SortType } from '../types';

import { buildSort } from './sort';
import { RowProps } from './types';

/**
 * Displays provided list of entities as table. Supported features:
 * 1) sorting via arrow buttons in the header
 * 2) stable row keys based on entity[uidFieldId]
 * 3) (if present) display nodes passed via children prop instead of entities (extension point to handle empty state end related corner cases)
 *
 * @see useSort
 */
export function TableView<T>({
  uidFieldId = UID,
  visibleColumns,
  entities,
  'aria-label': ariaLabel,
  Row,
  children,
  activeSort,
  setActiveSort,
  currentNamespace,
}: TableViewProps<T>) {
  const { t } = useTranslation();
  const hasChildren = children.filter(Boolean).length > 0;
  const columnSignature = visibleColumns.map(({ id }) => id).join();
  return (
    <TableComposable aria-label={ariaLabel} variant="compact" isStickyHeader>
      <Thead>
        <Tr>
          {visibleColumns.map(({ id, toLabel, sortable }, columnIndex) => (
            <Th
              key={id}
              sort={
                sortable &&
                buildSort({
                  activeSort,
                  columnIndex,
                  columns: visibleColumns,
                  setActiveSort,
                })
              }
            >
              {toLabel(t)}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {hasChildren && (
          <Tr>
            <Td colSpan={visibleColumns.length || 1}>
              <Bullseye>{children}</Bullseye>
            </Td>
          </Tr>
        )}
        {!hasChildren &&
          entities.map((entity, index) => (
            <Row
              key={`${columnSignature}_${entity?.[uidFieldId] ?? index}`}
              entity={entity}
              columns={visibleColumns}
              currentNamespace={currentNamespace}
            />
          ))}
      </Tbody>
    </TableComposable>
  );
}

interface TableViewProps<T> {
  visibleColumns: Field[];
  entities: T[];
  'aria-label': string;
  /**
   * entity[uidFieldId] is used to uniquely identify a row. Defaults to UID column.
   */
  uidFieldId?: string;
  /**
   * Maps entities to table rows.
   */
  Row(props: RowProps<T>): JSX.Element;
  /**
   * Nodes to be displayed instead of the entities.
   * Extension point to handle empty state and related cases.
   */
  children?: ReactNode[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
  currentNamespace: string;
}
