import type { Meta, StoryObj } from '@storybook/react';

import { NoResultsMatchFilter } from '../../components/Page/PageStates';

const meta: Meta<typeof NoResultsMatchFilter> = {
  title: 'Common package components/Page/NoResultsMatchFilter',
  component: NoResultsMatchFilter,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'The page component is used to define the basic layout of a page.',
  },
};

export default meta;
type Story = StoryObj<typeof NoResultsMatchFilter>;

export const Basic: Story = {};
