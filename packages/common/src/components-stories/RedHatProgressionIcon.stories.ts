import type { Meta, StoryObj } from '@storybook/react';

import { RedHatProgressionIcon } from '../components/Icons';

/**
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Icons/RedHatProgressionIcon.tsx)
 */
const meta: Meta<typeof RedHatProgressionIcon> = {
  title: 'Common package components/RedHatProgressionIcon',
  component: RedHatProgressionIcon,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'An Icon is a piece of visual element.',
  },
};

export default meta;
type Story = StoryObj<typeof RedHatProgressionIcon>;

/**
 *
 */
export const Basic: Story = {
  args: {},
};
