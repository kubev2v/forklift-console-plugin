import { t } from '@utils/i18n';

const VM_ERROR_PHASE_LABELS: Record<string, string> = {
  ConvertGuest: 'Guest conversion',
  CreateGuestConversionPod: 'Guest conversion setup',
  PowerOffSource: 'Power off source VM',
};

export const getVmErrorPhaseLabel = (phase: string | undefined): string | undefined => {
  if (!phase) {
    return undefined;
  }

  const key = VM_ERROR_PHASE_LABELS[phase];
  return key ? t(key) : phase;
};
