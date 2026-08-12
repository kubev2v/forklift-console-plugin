import type { ReactNode } from 'react';

export type Field = {
  cacertHelperTextPopover?: ReactNode;
  description: ReactNode;
  displayType?: 'text' | 'textArea' | 'switch';
  helperTextPopover?: ReactNode;
  label: string;
};

// Define the type for the object containing all fields
export type Fields = Record<string, Field>;
