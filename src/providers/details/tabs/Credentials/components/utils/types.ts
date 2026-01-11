import type { ReactNode } from 'react';

export type Field = {
  label: string;
  description: ReactNode;
  helperTextPopover?: ReactNode;
  cacertHelperTextPopover?: ReactNode;
  displayType?: 'text' | 'textArea' | 'switch';
};

// Define the type for the object containing all fields
export type Fields = Record<string, Field>;
