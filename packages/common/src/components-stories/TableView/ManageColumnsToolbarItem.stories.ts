import type { Meta, StoryObj } from '@storybook/react';

import { ManageColumnsToolbarItem } from '../../components/TableView/ManageColumnsToolbarItem';

const meta: Meta<typeof ManageColumnsToolbarItem> = {
  title: 'Common package components/TableView/ManageColumnsToolbarItem',
  component: ManageColumnsToolbarItem,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'A table is used to display large data sets that can be easily laid out in a simple grid with column headers.',
  },
};

export default meta;
type Story = StoryObj<typeof ManageColumnsToolbarItem>;

export const Basic: Story = {};
