import { Spinner } from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';
import type { Meta, StoryObj } from '@storybook/react';

import { BaseState } from '../../components/Page/PageStates';

const meta: Meta<typeof BaseState> = {
  title: 'Common package components/Page/BaseState',
  component: BaseState,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'The page component is used to define the basic layout of a page.',
  },
  argTypes: {
    title: {
      table: {
        defaultValue: { summary: '' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseState>;

export const ErrorState: Story = {
  args: {
    Icon: ExclamationCircleIcon,
    color: '#C9190B',
    title: 'This is an error page title.',
  },
};

export const LoadingState: Story = {
  args: {
    Component: Spinner,
    title: 'This is a loading page title.',
  },
};

export const NoResultsFoundState: Story = {
  args: {
    Icon: SearchIcon,
    title: 'This is no results found page title.',
  },
};
