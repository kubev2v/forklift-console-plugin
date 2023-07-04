import React from 'react';

import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { FreetextFilter } from '../../components/Filter/FreetextFilter';

const meta: Meta<typeof FreetextFilter> = {
  title: 'Common package components/Filter/FreetextFilter',
  component: FreetextFilter,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Toolbar style={{ padding: 0, paddingBottom: 50 }}>
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
    supportedValues: { table: { disable: true } },
    supportedGroups: { table: { disable: true } },
    resolvedLanguage: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof FreetextFilter>;

/**
 * This example is used when there are a number of selected filter values entered by the user``'China', 'Japan', 'Fr', 'it'``.
 *
 */
export const SelectedFewValues: Story = {
  args: {
    showFilter: true,
    placeholderLabel: 'Filter by country name',
    title: 'Filter country name',
    selectedFilters: ['China', 'japan', 'Fr', 'it'],
  },
};

/**
 * This example is used when the selected filters list is empty,
 * i.e. no values are selected, the result of clicking on *``Clear all filters``* button
 *
 */
export const NoSelectedValues: Story = {
  args: {
    showFilter: true,
    placeholderLabel: 'Filter by country name',
    title: 'Filter Country names',
    selectedFilters: [],
  },
};
