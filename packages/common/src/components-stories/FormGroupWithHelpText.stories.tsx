import React from 'react';

import { TextInput } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import { FormGroupWithHelpText } from '../components/FormGroupWithHelpText';

const meta: Meta<typeof FormGroupWithHelpText> = {
  title: 'Common package components/FormGroupWithHelpText',
  component: FormGroupWithHelpText,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'A component that wraps the FormGroup component with an option to support helper texts.',
  },
};

export default meta;
type Story = StoryObj<typeof FormGroupWithHelpText>;

/**
 * This example is used when there is a text field which is validated to *``default``* value.
 */
export const DefaultValidatedHelpText: Story = {
  args: {
    label: 'Username',
    isRequired: true,
    children: <TextInput isRequired type="text" name="user" value="myName" validated="default" />,
    helperText: 'This is a help text',
    helperTextInvalid: 'This is a help text for an invalid case',
    validated: 'default',
  },
};

/**
 * This example is used when there is a text field which is validated to *``success``* value.
 */
export const SuccessValidatedHelpText: Story = {
  args: {
    label: 'Username',
    isRequired: true,
    children: <TextInput isRequired type="text" name="user" value="myName" validated="success" />,
    helperText: 'This is a help text',
    helperTextInvalid: 'This is a help text for an invalid case',
    validated: 'success',
  },
};

/**
 * This example is used when there is a text field which is validated to *``warning``* value.
 */
export const WarningValidatedHelpText: Story = {
  args: {
    label: 'Username',
    isRequired: true,
    children: <TextInput isRequired type="text" name="user" value="my%Name" validated="warning" />,
    helperText: 'This is a warning help text indicating that a % char is not recommended',
    helperTextInvalid: 'This is a help text for an invalid case',
    validated: 'warning',
  },
};

/**
 * This example is used when there is a text field which is validated to *``error``* value.
 */
export const ErrorValidatedHelpText: Story = {
  args: {
    label: 'Username',
    isRequired: true,
    children: <TextInput isRequired type="text" name="user" value="my Name" validated="error" />,
    helperText: 'This is a help text',
    helperTextInvalid:
      'This is an error help text indicating that an invalid space char is not allowed',
    validated: 'error',
  },
};

/**
 * This example is used when there is a text field which is validated to *``error``* value and the  *``helperTextInvalid``* field is undefined.
 */
export const ErrorValidatedUndefinedHelpText: Story = {
  args: {
    label: 'Username',
    isRequired: true,
    children: <TextInput isRequired type="text" name="user" value="my Name" validated="error" />,
    helperText: 'This is a help text',
    helperTextInvalid: undefined,
    validated: 'error',
  },
};
