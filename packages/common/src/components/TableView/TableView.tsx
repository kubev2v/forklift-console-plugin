import React, { ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Thead, Tr } from '@patternfly/react-table';

import { ResourceField, UID } from '../../utils';

import { RowProps, SortType, TableViewHeaderProps } from './types';

/**
 * Displays provided list of entities as table.
 *
 * **Supported features:**<br>
 * 1) sorting via arrow buttons in the header.<br>
 * 2) stable row keys based on resourceData[uidFieldId].<br>
 * 3) (if present) display nodes passed via children prop instead of entities (extension point to handle empty state end related corner cases).
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github"></i>
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/TableView.tsx)
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
          <Header {...{ activeSort, setActiveSort, visibleColumns, dataOnScreen: entities }} />
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
              namespace={currentNamespace}
              resourceIndex={index}
            />
          ))}
      </Tbody>
    </TableComposable>
  );
}

interface TableViewProps<T> {
  /**
   * List of visible columns and their properties
   */
  visibleColumns: ResourceField[];
  /**
   * List of rows content
   */
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
  /**
   * Specify which column is currently used for sorting the table
   * and is it ascending or descending order.
   */
  activeSort: SortType;
  /**
   * A handler for applying the sorting
   */
  setActiveSort: (sort: SortType) => void;
  /**
   * The current Namespace
   */
  currentNamespace: string;

  /**
   * Maps resourceFields to header rows.
   */
  Header(props: TableViewHeaderProps<T>): JSX.Element;
}
