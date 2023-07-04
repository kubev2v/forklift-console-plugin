import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Intro & Examples/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'Primary UI component for user interaction.',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * This example is used when this is the **primary** button. The primary button style used to gu  ide users forward in a flow. Used only once per page
 */
export const Primary: Story = {
  args: {
    label: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
    primary: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This example is used when this is the **secondary** button. The secondary button styled used more frequently for secondary actions.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    label: 'Button',
    size: 'large',
  },
};

export const Small: Story = {
  args: {
    label: 'Button',
    size: 'small',
  },
};
