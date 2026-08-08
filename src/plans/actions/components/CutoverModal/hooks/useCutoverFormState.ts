import { useState } from 'react';

import { formatDateTo12Hours } from '../utils/utils';

const CUTOVER_MODE_ASAP = 'asap' as const;
const CUTOVER_MODE_SCHEDULED = 'scheduled' as const;

type CutoverMode = typeof CUTOVER_MODE_ASAP | typeof CUTOVER_MODE_SCHEDULED;

export { CUTOVER_MODE_ASAP, CUTOVER_MODE_SCHEDULED };

const getInitialCutoverDate = (existingCutoverValue: string | undefined): string =>
  existingCutoverValue ?? new Date().toISOString();

type UseCutoverFormStateResult = {
  cutoverDate: string;
  cutoverMode: CutoverMode;
  setCutoverDate: (value: string) => void;
  setCutoverMode: (mode: CutoverMode) => void;
  setTime: (value: string) => void;
  time: string;
};

export const useCutoverFormState = (
  existingCutoverValue: string | undefined,
): UseCutoverFormStateResult => {
  const hasExistingCutover = Boolean(existingCutoverValue);
  const initialCutoverDate = getInitialCutoverDate(existingCutoverValue);

  const [cutoverDate, setCutoverDate] = useState<string>(initialCutoverDate);
  const [time, setTime] = useState<string>(() => formatDateTo12Hours(new Date(initialCutoverDate)));
  const [cutoverMode, setCutoverMode] = useState<CutoverMode>(
    hasExistingCutover ? CUTOVER_MODE_SCHEDULED : CUTOVER_MODE_ASAP,
  );
  const [prevExistingCutoverValue, setPrevExistingCutoverValue] = useState(existingCutoverValue);

  if (existingCutoverValue !== prevExistingCutoverValue) {
    setPrevExistingCutoverValue(existingCutoverValue);
    const migrationCutoverDate = getInitialCutoverDate(existingCutoverValue);
    setCutoverDate(migrationCutoverDate);
    setTime(formatDateTo12Hours(new Date(migrationCutoverDate)));
    setCutoverMode(existingCutoverValue ? CUTOVER_MODE_SCHEDULED : CUTOVER_MODE_ASAP);
  }

  return {
    cutoverDate,
    cutoverMode,
    setCutoverDate,
    setCutoverMode,
    setTime,
    time,
  };
};
