import type { Meta, StoryObj } from '@storybook/react';

import { SwitchFilter } from '../../components/Filter/SwitchFilter';

const meta: Meta<typeof SwitchFilter> = {
  title: 'Common package components/Filter/SwitchFilter',
  component: SwitchFilter,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Filters allow users to narrow down content from data in tables, data lists or card views, among many others.',
  },
  argTypes: {
    showFilter: { table: { disable: true } },
    title: { table: { disable: true } },
    supportedValues: { table: { disable: true } },
    supportedGroups: { table: { disable: true } },
    resolvedLanguage: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof SwitchFilter>;

/**
 * This example is used when the filter value is set to True.
 * Clicking on the filter will trigger a dev tools console logging with the filter value.
 */
export const FilterIsOn: Story = {
  args: {
    selectedFilters: ['true'],
    placeholderLabel: 'Filter by name',
  },
};

/**
 * This example is used when the filter value is set to False.
 * Clicking on the filter will trigger a dev tools console logging with the filter value.
 */
export const FilterIsOff: Story = {
  args: {
    selectedFilters: [''],
    placeholderLabel: 'Filter by name',
  },
};
