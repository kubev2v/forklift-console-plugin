import React from 'react';

import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { EnumFilter } from '../../components/Filter/EnumFilter';

const meta: Meta<typeof EnumFilter> = {
  title: 'Common package components/Filter/EnumFilter',
  component: EnumFilter,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Toolbar style={{ padding: 0, paddingBottom: 150 }}>
        <ToolbarContent>
          <Story />
        </ToolbarContent>
      </Toolbar>
    ),
  ],
  parameters: {
    componentSubtitle:
      'Filters allow users to narrow down content from data in tables, data lists or card views, among many others.',
  },
  argTypes: {
    supportedGroups: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof EnumFilter>;

/**
 * This example is used when there are a number of selected filter values ``'China', 'Japan', 'France'``.
 *
 */
export const SelectedFewValues: Story = {
  args: {
    placeholderLabel: 'Country names',
    title: 'Filter Country names',
    showFilter: true,
    supportedValues: [
      { id: 'china', label: 'China' },
      { id: 'india', label: 'India' },
      { id: 'japan', label: 'Japan' },
      { id: 'cyprus', label: 'Cyprus' },
      { id: 'france', label: 'France' },
    ],
    selectedFilters: ['china', 'japan', 'france', 'cyprus'],
  },
};

/**
 * This example is used when the selected filters list is empty,
 * i.e. no values are selected, the result of clicking on *``Clear all filters``* button
 *
 */
export const NoSelectedValues: Story = {
  args: {
    placeholderLabel: 'Country names',
    title: 'Filter Country names',
    showFilter: true,
    supportedValues: [
      { id: 'china', label: 'China' },
      { id: 'india', label: 'India' },
      { id: 'japan', label: 'Japan' },
      { id: 'france', label: 'France' },
    ],
    selectedFilters: [],
  },
};
