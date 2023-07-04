import type { Meta, StoryObj } from '@storybook/react';

import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Intro & Examples/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
    componentSubtitle: 'The Header UI component.',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

/**
 * This Header example is used after a user named `'Jane Doe'` was logged in
 */
export const onLogin: Story = {
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
};

export const onLogout: Story = {
  args: {
    user: {
      name: null,
    },
  },
};
