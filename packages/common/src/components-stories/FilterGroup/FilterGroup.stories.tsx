import React from 'react';

import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { toFieldFilter } from '../../components/FilterGroup';
import { FilterGroup } from '../../components/FilterGroup/FilterGroup';
import { defaultSupportedFilters } from '../../components/FilterGroup/matchers';
import { ResourceField } from '../../utils';

const meta: Meta<typeof FilterGroup> = {
  title: 'Common package components/FilterGroup/FilterGroup',
  component: FilterGroup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Toolbar style={{ padding: 0, paddingBottom: 270 }}>
        <ToolbarContent>
          <Story />
        </ToolbarContent>
      </Toolbar>
    ),
  ],
  parameters: {
    componentSubtitle: 'A filter group is a set of filters that appear side by side in a toolbar.',
  },
};

export default meta;
type Story = StoryObj<typeof FilterGroup>;

const fieldsMetadata: ResourceField[] = [
  {
    resourceFieldId: 'name',
    label: 'Name',
    isIdentity: true,
    isVisible: true,
    filter: {
      primary: true,
      type: 'freetext',
      placeholderLabel: 'Filter by name',
    },
  },
  {
    resourceFieldId: 'type',
    label: 'Type',
    isIdentity: true,
    isVisible: true,
    filter: {
      primary: true,
      type: 'groupedEnum',
      placeholderLabel: 'Filter by type',
      values: [
        { id: 'china', groupId: 'asia', label: 'China' },
        { id: 'india', groupId: 'asia', label: 'India' },
        { id: 'japan', groupId: 'asia', label: 'Japan' },
        { id: 'cyprus', groupId: 'asia', label: 'Cyprus' },
        { id: 'france', groupId: 'europe', label: 'France' },
      ],
      groups: [
        { groupId: 'europe', label: 'Europe' },
        { groupId: 'asia', label: 'Asia' },
      ],
    },
  },
  {
    resourceFieldId: 'archived',
    label: 'Archived',
    isIdentity: true,
    isVisible: true,
    filter: {
      primary: true,
      type: 'slider',
      placeholderLabel: 'Show archived',
    },
  },
];

/**
 * Filter group with ``Free text, Grouped Enum`` and ``Switch`` filters, while there are a number of selected values for all.
 *
 * ``Free Text``filter - in this example is represented by *`Filter by name`*.  See link to [FreetextFilter stories](/docs/common-components-filter-freetextfilter--documentation).
 * ``Grouped Enum``filter - in this example is represented by *`Filter by type`*.  See link to [GroupedEnumFilter stories](/docs/common-components-filter-groupedenumfilter--documentation).
 * ``Switch``filter - in this example is represented by *`Show archived`*.  See link to [FreetextFilter stories](/docs/common-components-filter-switchfilter--documentation).
 */
export const FilterGroupWithMultipleSelectionTypes: Story = {
  args: {
    selectedFilters: {
      name: ['china', 'india', 'japan'],
      type: ['india', 'japan', 'france'],
      archived: ['true'],
    },
    fieldFilters: fieldsMetadata.filter((field) => field.filter?.primary).map(toFieldFilter),
    supportedFilterTypes: defaultSupportedFilters,
  },
};

/**
 * Filter group with ``Free text, Grouped Enum`` and ``Switch`` filters, while no selected values,
 * i.e. the result of clicking on *``Clear all filters``* button
 *
 * ``Free Text``filter - in this example is represented by *`Filter by name`*.  See link to [FreetextFilter stories](/docs/common-components-filter-freetextfilter--documentation)
 * ``Grouped Enum``filter - in this example is represented by *`Filter by type`*.  See link to [GroupedEnumFilter stories](/docs/common-components-filter-groupedenumfilter--documentation)
 * ``Switch``filter - in this example is represented by *`Show archived`*.  See link to [FreetextFilter stories](/docs/common-components-filter-switchfilter--documentation)
 */
export const FilterGroupWithNoSelectedValues: Story = {
  args: {
    selectedFilters: {},
    fieldFilters: fieldsMetadata.filter((field) => field.filter?.primary).map(toFieldFilter),
    supportedFilterTypes: defaultSupportedFilters,
  },
};
