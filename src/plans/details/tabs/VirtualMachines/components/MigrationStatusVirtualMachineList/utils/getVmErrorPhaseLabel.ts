import type { TFunction } from 'i18next';

const VM_ERROR_PHASE_LABELS: Record<string, string> = {
  ConvertGuest: 'Guest conversion',
  CreateGuestConversionPod: 'Guest conversion setup',
  PowerOffSource: 'Power off source VM',
};

export const getVmErrorPhaseLabel = (
  phase: string | undefined,
  translate: TFunction,
): string | undefined => {
  if (!phase) {
    return undefined;
  }

  const key = VM_ERROR_PHASE_LABELS[phase];
  return key ? translate(key) : phase;
};
