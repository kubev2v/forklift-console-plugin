import type { VirtualizationValidation } from '../types';

export const isValidationActive = (validation: VirtualizationValidation | undefined): boolean =>
  validation?.status?.phase === 'Pending' || validation?.status?.phase === 'Running';
