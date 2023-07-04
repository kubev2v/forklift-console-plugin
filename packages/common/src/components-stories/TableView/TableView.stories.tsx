import React from 'react';

import { Level, LevelItem, PageSection, Title } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import type { Meta, StoryObj } from '@storybook/react';

import { ErrorState, Loading } from '../../components/Page';
import { DefaultHeader, RowProps } from '../../components/TableView';
import { TableView } from '../../components/TableView/TableView';
import { ResourceField } from '../../utils';

const meta: Meta<typeof TableView> = {
  title: 'Common package components/TableView/TableView',
  component: TableView,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <PageSection variant="light">
          <Level>
            <LevelItem>
              <Title headingLevel="h1">Simple Table View</Title>
            </LevelItem>
          </Level>
        </PageSection>
        <PageSection>
          <Story />
        </PageSection>
      </>
    ),
  ],
  parameters: {
    componentSubtitle:
      'A table is used to display large data sets that can be easily laid out in a simple grid with column headers.',
  },
};

export default meta;
type Story = StoryObj<typeof TableView>;

interface Simple {
  name: string;
  namespace: string;
  type: string;
}

const dataSource: Simple[] = [
  { name: 'name1', namespace: 'namespace1', type: 'type1' },
  { name: 'name2', namespace: 'namespace2', type: 'type2' },
  { name: 'name3', namespace: 'namespace3', type: 'type3' },
];

const visibleColumns: ResourceField[] = [
  {
    resourceFieldId: 'name',
    label: 'Name',
    isIdentity: true,
    isVisible: true,
    sortable: true,
    filter: {
      primary: true,
      type: 'freetext',
      placeholderLabel: 'Filter by name',
    },
  },
  {
    resourceFieldId: 'namespace',
    label: 'Namespace',
    isIdentity: true,
    isVisible: true,
    sortable: true,
    filter: {
      type: 'freetext',
      placeholderLabel: 'Filter by namespace',
    },
  },
  {
    resourceFieldId: 'type',
    label: 'Type',
    isIdentity: true,
    isVisible: true,
    sortable: true,
    filter: {
      type: 'freetext',
      placeholderLabel: 'Filter by type',
    },
  },
];

function SimpleRow<T>({ resourceFields, resourceData }: RowProps<T>) {
  return (
    <Tr ouiaId={undefined} ouiaSafe={undefined}>
      {resourceFields.map(({ resourceFieldId, label }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {String(resourceData[resourceFieldId] ?? '')}
        </Td>
      ))}
    </Tr>
  );
}

/**
 * A table with 3 sortable columns, sorted by the ``Name`` column
 */
export const BasicTableWithSortedColumns: Story = {
  args: {
    children: [],
    visibleColumns: visibleColumns,
    entities: dataSource,
    'aria-label': 'Simple Table',
    currentNamespace: 'My namespace',
    activeSort: {
      resourceFieldId: 'name',
      isAsc: true,
      label: 'Name',
    },
    Header: DefaultHeader,
    Row: SimpleRow,
  },
};

/**
 * A table with fetching data error
 */
export const BasicTableWithFetchingDataError: Story = {
  args: {
    children: [<ErrorState key="error" title="Unable to retrieve data" />],
    visibleColumns: visibleColumns,
    entities: dataSource,
    'aria-label': 'Simple Table',
    currentNamespace: 'My namespace',
    activeSort: {
      resourceFieldId: 'name',
      isAsc: true,
      label: 'Name',
    },
    Header: DefaultHeader,
    Row: SimpleRow,
  },
};

/**
 * A table in loading data state
 */
export const BasicTableInLoadingDataState: Story = {
  args: {
    children: [<Loading key="loading" title={'Loading'} />],
    visibleColumns: visibleColumns,
    entities: dataSource,
    'aria-label': 'Simple Table',
    currentNamespace: 'My namespace',
    activeSort: {
      resourceFieldId: 'name',
      isAsc: true,
      label: 'Name',
    },
    Header: DefaultHeader,
    Row: SimpleRow,
  },
};
