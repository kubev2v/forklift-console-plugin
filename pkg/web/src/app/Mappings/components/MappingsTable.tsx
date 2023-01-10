import * as React from 'react';
import { Pagination, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  sortable,
  classNames as classNamesTransform,
  IRow,
  expandable,
  truncate,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSelectionState } from '@migtools/lib-ui';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IMetaObjectMeta, Mapping, MappingType } from '@app/queries/types';
import { MappingsActionsDropdown } from './MappingsActionsDropdown';
import { MappingDetailView } from './MappingDetailView';
import { MappingStatus } from './MappingStatus';
import { isSameResource } from '@app/queries/helpers';
import { useClusterProvidersQuery } from '@app/queries';
import { ENV } from '@app/common/constants';

interface IMappingsTableProps {
  mappings: Mapping[];
  mappingType: MappingType;
  openEditMappingModal: (mapping: Mapping) => void;
}

export const MappingsTable: React.FunctionComponent<IMappingsTableProps> = ({
  mappings,
  mappingType,
  openEditMappingModal,
}: IMappingsTableProps) => {
  const namespace = ENV.DEFAULT_NAMESPACE;
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);

  const getSortValues = (mapping: Mapping) => {
    const {
      metadata,
      spec: { provider },
    } = mapping;
    return [
      '', // Expand control column
      (metadata as IMetaObjectMeta).name || '',
      provider.source.name,
      provider.destination.name,
      '', // Status column  -- TODO can we even get a sort value for this?
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(mappings, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { toggleItemSelected: toggleMappingExpanded, isItemSelected: isMappingExpanded } =
    useSelectionState<Mapping>({
      items: sortedItems,
      isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
    });

  const columns: ICell[] = [
    {
      title: 'Name',
      transforms: [sortable],
      cellFormatters: [expandable],
      cellTransforms: [truncate],
    },
    { title: 'Source provider', transforms: [sortable] },
    { title: 'Target provider', transforms: [sortable] },
    { title: 'Status' },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((mapping: Mapping) => {
    const {
      metadata,
      spec: { provider },
    } = mapping;
    const sourceProviderObj =
      clusterProvidersQuery.data?.items.find((p) => isSameResource(p.metadata, provider.source)) ||
      null;
    const isExpanded = isMappingExpanded(mapping);
    rows.push({
      meta: { mapping },
      isOpen: isExpanded,
      cells: [
        (metadata as IMetaObjectMeta).name,
        provider.source.name,
        provider.destination.name,
        {
          title: <MappingStatus mappingType={mappingType} mapping={mapping} />,
        },
        {
          title: (
            <MappingsActionsDropdown
              mappingType={mappingType}
              mapping={mapping}
              openEditMappingModal={openEditMappingModal}
            />
          ),
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: (
              <Form>
                <MappingDetailView
                  mappingType={mappingType}
                  sourceProviderType={sourceProviderObj?.spec.type || 'vsphere'}
                  mapping={mapping}
                  className={spacing.mLg}
                />
              </Form>
            ),
            props: { colSpan: columns.length + 1, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
  });

  return (
    <>
      <Pagination {...paginationProps} widgetId="mappings-table-pagination-top" />
      <Table
        variant="compact"
        aria-label="Mappings table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onCollapse={(event, rowKey, isOpen, rowData) => {
          toggleMappingExpanded(rowData.meta.mapping);
        }}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        {...paginationProps}
        widgetId="mappings-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};
