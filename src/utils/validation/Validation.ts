import type { ReactNode } from 'react';

export enum ValidationState {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Default = 'default',
}

export type ValidationMsg = {
  type: ValidationState;
  msg?: string | ReactNode;
  description?: string | ReactNode;
};
