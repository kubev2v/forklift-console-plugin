import type { VirtualizationValidation } from '../types';

export const getLatestConditionMessage = (
  validation: VirtualizationValidation | undefined,
): string | undefined => validation?.status?.conditions?.at(-1)?.message;
