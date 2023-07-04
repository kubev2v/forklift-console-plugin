import React from 'react';

import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { toFieldFilter } from '../../components/FilterGroup';
import { AttributeValueFilter } from '../../components/FilterGroup/AttributeValueFilter';
import { defaultSupportedFilters } from '../../components/FilterGroup/matchers';
import { ResourceField } from '../../utils';

const meta: Meta<typeof AttributeValueFilter> = {
  title: 'Common package components/FilterGroup/AttributeValueFilter',
  component: AttributeValueFilter,
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
    componentSubtitle:
      'The attribute value filter gives users the ability to specify an attribute-value pair for filtering a data set.',
  },
};

export default meta;
type Story = StoryObj<typeof AttributeValueFilter>;

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
 * Attribute value with ``Free text, Grouped Enum`` and ``Switch`` filters, while there are a number of selected values for all.
 *
 * ``Free Text``filter - in this example is represented by *`Filter by name`*.  See link to [FreetextFilter stories](/docs/common-components-filter-freetextfilter--documentation).
 * ``Grouped Enum``filter - in this example is represented by *`Filter by type`*.  See link to [GroupedEnumFilter stories](/docs/common-components-filter-groupedenumfilter--documentation).
 * ``Switch``filter - in this example is represented by *`Show archived`*.  See link to [FreetextFilter stories](/docs/common-components-filter-switchfilter--documentation).
 */
export const AttributeValueWithMultipleSelectionTypes: Story = {
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
 * Attribute value with ``Free text, Grouped Enum`` and ``Switch`` filters, while no selected values,
 * i.e. the result of clicking on *``Clear all filters``* button
 *
 * ``Free Text``filter - in this example is represented by *`Filter by name`*.  See link to [FreetextFilter stories](/docs/common-components-filter-freetextfilter--documentation)
 * ``Grouped Enum``filter - in this example is represented by *`Filter by type`*.  See link to [GroupedEnumFilter stories](/docs/common-components-filter-groupedenumfilter--documentation)
 * ``Switch``filter - in this example is represented by *`Show archived`*.  See link to [FreetextFilter stories](/docs/common-components-filter-switchfilter--documentation)
 */
export const AttributeValueWithNoSelectedValues: Story = {
  args: {
    selectedFilters: {},
    fieldFilters: fieldsMetadata.filter((field) => field.filter?.primary).map(toFieldFilter),
    supportedFilterTypes: defaultSupportedFilters,
  },
};
