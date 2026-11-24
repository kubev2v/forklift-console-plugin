import type { VirtualizationValidation } from '../types';

export const isValidationActive = (validation: VirtualizationValidation | undefined): boolean =>
  validation !== undefined &&
  (validation.status?.phase === undefined ||
    validation.status.phase === 'Pending' ||
    validation.status.phase === 'Running');
