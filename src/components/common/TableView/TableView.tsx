import type { FC, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import { UID } from '../utils/constants';
import type { ResourceField } from '../utils/types';

import type { RowProps, SortType, TableViewHeaderProps } from './types';

import './TableView.scss';

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
export const TableView = <T,>({
  activeSort,
  'aria-label': ariaLabel,
  children,
  currentNamespace,
  emptyStateColSpan = '100%',
  entities,
  expandedIds,
  Header,
  Row,
  setActiveSort,
  toId,
  uidFieldId = UID,
  visibleColumns,
}: TableViewProps<T>) => {
  const hasChildren = !isEmpty(children?.filter(Boolean));
  const columnSignature = visibleColumns.map(({ resourceFieldId: id }) => id).join();

  return (
    <Table aria-label={ariaLabel} variant="compact" isStickyHeader className="table-view">
      <Thead>
        <Tr>
          <Header {...{ activeSort, dataOnScreen: entities, setActiveSort, visibleColumns }} />
        </Tr>
      </Thead>
      <Tbody>
        {hasChildren && (
          <Tr>
            <Td colSpan={emptyStateColSpan as number}>
              <Bullseye>{children}</Bullseye>
            </Td>
          </Tr>
        )}
        {!hasChildren &&
          entities.map((resourceData: T, index) => (
            <Row
              key={`${columnSignature}_${String(resourceData?.[uidFieldId as keyof T] ?? index)}`}
              resourceData={resourceData}
              resourceFields={visibleColumns}
              namespace={currentNamespace}
              resourceIndex={index}
              length={visibleColumns.length}
              isExpanded={expandedIds?.includes(toId ? toId(resourceData) : '')}
            />
          ))}
      </Tbody>
    </Table>
  );
};

type TableViewProps<T> = {
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
  Row: FC<RowProps<T>>;
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
  Header: FC<TableViewHeaderProps<T>>;

  /**
   * @returns string that can be used as an unique identifier
   */
  toId?: (item: T) => string;

  /**
   * @returns true if items can be selected, false otherwise
   */
  canSelect?: (item: T) => boolean;

  /**
   * onSelect is called when selection changes
   */
  onSelect?: (selectedIds: string[]) => void;

  /**
   * Selected ids
   */
  selectedIds?: string[];

  /**
   * onExpand is called when expand changes
   */
  onExpand?: (expandedIds: string[]) => void;

  /**
   * Expanded ids
   */
  expandedIds?: string[];

  /**
   * colSpan of empty state
   */
  emptyStateColSpan?: number | string;
};
