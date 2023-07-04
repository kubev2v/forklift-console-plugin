import React from 'react';

import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { GroupedEnumFilter } from '../../components/Filter/GroupedEnumFilter';

const meta: Meta<typeof GroupedEnumFilter> = {
  title: 'Common package components/Filter/GroupedEnumFilter',
  component: GroupedEnumFilter,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Toolbar style={{ padding: 0, paddingBottom: 260 }}>
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
    title: { table: { disable: true } },
    resolvedLanguage: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof GroupedEnumFilter>;

/**
 * This example is used when the selected filter values ``'India', 'Japan', 'France'`` include values from different groups:
 *
 */
export const SelectedValuesFromDifferentGroups: Story = {
  args: {
    placeholderLabel: 'Country names',
    showFilter: true,
    supportedGroups: [
      { groupId: 'europe', label: 'Europe' },
      { groupId: 'asia', label: 'Asia' },
    ],
    supportedValues: [
      { id: 'china', groupId: 'asia', label: 'China' },
      { id: 'india', groupId: 'asia', label: 'India' },
      { id: 'japan', groupId: 'asia', label: 'Japan' },
      { id: 'cyprus', groupId: 'asia', label: 'Cyprus' },
      { id: 'france', groupId: 'europe', label: 'France' },
    ],
    selectedFilters: ['india', 'japan', 'france'],
  },
};

/**
 * This example is used when the selected filter values ``'India', 'Japan'`` include values from only one group:
 *
 */
export const SelectedValuesFromOneGroup: Story = {
  args: {
    placeholderLabel: 'Country names',
    showFilter: true,
    supportedGroups: [
      { groupId: 'europe', label: 'Europe' },
      { groupId: 'asia', label: 'Asia' },
    ],
    supportedValues: [
      { id: 'china', groupId: 'asia', label: 'China' },
      { id: 'india', groupId: 'asia', label: 'India' },
      { id: 'japan', groupId: 'asia', label: 'Japan' },
      { id: 'cyprus', groupId: 'asia', label: 'Cyprus' },
      { id: 'thailand', groupId: 'asia', label: 'Thailand' },
      { id: 'france', groupId: 'europe', label: 'France' },
    ],
    selectedFilters: ['india', 'japan', 'china', 'cyprus'],
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
    showFilter: true,
    supportedGroups: [
      { groupId: 'europe', label: 'Europe' },
      { groupId: 'asia', label: 'Asia' },
    ],
    supportedValues: [
      { id: 'China', groupId: 'asia', label: 'China' },
      { id: 'India', groupId: 'asia', label: 'India' },
      { id: 'Japan', groupId: 'asia', label: 'Japan' },
      { id: 'cyprus', groupId: 'asia', label: 'Cyprus' },
      { id: 'France', groupId: 'europe', label: 'France' },
    ],
    selectedFilters: [],
  },
};
