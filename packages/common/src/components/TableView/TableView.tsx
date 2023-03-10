import React, { ReactNode } from 'react';
import { UID } from 'common/src/utils/constants';

import { Bullseye } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Thead, Tr } from '@patternfly/react-table';

import { ResourceField, SortType } from '../types';

import { RowProps, TableViewHeaderProps } from './types';

/**
 * Displays provided list of entities as table. Supported features:
 * 1) sorting via arrow buttons in the header
 * 2) stable row keys based on resourceData[uidFieldId]
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
  Header,
}: TableViewProps<T>) {
  const hasChildren = children.filter(Boolean).length > 0;
  const columnSignature = visibleColumns.map(({ resourceFieldId: id }) => id).join();
  return (
    <TableComposable aria-label={ariaLabel} variant="compact" isStickyHeader>
      <Thead>
        <Tr>
          <Header {...{ activeSort, setActiveSort, visibleColumns }} />
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
          entities.map((resourceData, index) => (
            <Row
              key={`${columnSignature}_${resourceData?.[uidFieldId] ?? index}`}
              resourceData={resourceData}
              resourceFields={visibleColumns}
              currentNamespace={currentNamespace}
              rowIndex={index}
            />
          ))}
      </Tbody>
    </TableComposable>
  );
}

interface TableViewProps<T> {
  visibleColumns: ResourceField[];
  entities: T[];
  'aria-label': string;
  /**
   * resourceData[uidFieldId] is used to uniquely identify a row. Defaults to UID column.
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

  /**
   * Maps resourceFields to header rows.
   */
  Header(props: TableViewHeaderProps): JSX.Element;
}
