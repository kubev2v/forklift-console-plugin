import type { ReactNode } from 'react';

export const ValidationState = {
  Default: 'default',
  Error: 'error',
  Success: 'success',
  Warning: 'warning',
} as const;

export type ValidationStateType = (typeof ValidationState)[keyof typeof ValidationState];

export type ValidationMsg = {
  type: ValidationStateType;
  msg?: string | ReactNode;
  description?: string | ReactNode;
};
