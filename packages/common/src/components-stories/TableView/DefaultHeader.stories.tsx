import React from 'react';

import { TableComposable } from '@patternfly/react-table';
import type { Meta, StoryObj } from '@storybook/react';

import { DefaultHeader } from '../../components/TableView/DefaultHeader';

const meta: Meta<typeof DefaultHeader> = {
  title: 'Common package components/TableView/DefaultHeader',
  component: DefaultHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TableComposable>
        <Story />
      </TableComposable>
    ),
  ],
  parameters: {
    componentSubtitle:
      'A table is used to display large data sets that can be easily laid out in a simple grid with column headers.',
  },
};

export default meta;
type Story = StoryObj<typeof DefaultHeader>;

/**
 * A table header with 3 columns while sorted by the ``Name`` column
 */
export const Basic: Story = {
  args: {
    visibleColumns: [
      { resourceFieldId: 'type', label: 'Type', isVisible: true, sortable: false },
      { resourceFieldId: 'name', label: 'Name', isVisible: true, sortable: true },
      { resourceFieldId: 'status', label: 'Status', isVisible: true, sortable: true },
    ],
    activeSort: {
      resourceFieldId: 'name',
      isAsc: true,
      label: 'Name',
    },
  },
};
