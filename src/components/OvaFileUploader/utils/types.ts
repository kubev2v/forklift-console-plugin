import type { V1beta1Provider } from '@kubev2v/types';

export type OvaFileUploaderProps = {
  provider: V1beta1Provider;
};

export type UploadOvaResponse = {
  message: string;
  status: string;
};

export enum OvaValidationVariant {
  Default = 'default',
  Error = 'error',
  Indeterminate = 'indeterminate',
  Success = 'success',
  Warning = 'warning',
}
