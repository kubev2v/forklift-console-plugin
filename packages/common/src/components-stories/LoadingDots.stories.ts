import type { Meta, StoryObj } from '@storybook/react';

import { LoadingDots } from '../components/LoadingDots';

import './console_common.scss';

const meta: Meta<typeof LoadingDots> = {
  title: 'Common package components/LoadingDots',
  component: LoadingDots,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadingDots>;

export const Basic: Story = {
  args: {
    delayInMs: 500,
  },
};
