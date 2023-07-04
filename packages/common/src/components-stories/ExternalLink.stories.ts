import type { Meta, StoryObj } from '@storybook/react';

import { ExternalLink } from '../components/ExternalLink';

const meta: Meta<typeof ExternalLink> = {
  title: 'Common package components/ExternalLink',
  component: ExternalLink,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'An external link is a hyperlink that points at any domain other than the domain that the link exists on',
  },
};

export default meta;
type Story = StoryObj<typeof ExternalLink>;

/**
 * This example is used when there is no text required
 */
export const WithoutText: Story = {
  args: {
    href: 'https://www.redhat.com',
  },
};

export const WithNonInlineText: Story = {
  args: {
    href: 'https://www.redhat.com',
    isInline: false,
    children: 'Red Hat',
  },
  parameters: {
    style: { textDecoration: 'none' },
  },
};

export const WithInlineText: Story = {
  args: {
    href: 'https://www.redhat.com',
    isInline: true,
    children: 'Red Hat',
  },
};

export const WithInlineTextAndHiddenIcon: Story = {
  args: {
    href: 'https://www.redhat.com',
    isInline: true,
    children: 'Red Hat',
    hideIcon: true,
  },
};
