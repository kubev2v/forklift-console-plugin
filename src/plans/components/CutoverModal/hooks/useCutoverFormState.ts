import { useState } from 'react';

import { formatDateTo12Hours, getInitialCutoverDate, getInitialCutoverMode } from '../utils/utils';

const CUTOVER_MODE_ASAP = 'asap' as const;
const CUTOVER_MODE_SCHEDULED = 'scheduled' as const;
const CUTOVER_MODE_INHERIT = 'inherit' as const;

export type CutoverMode =
  typeof CUTOVER_MODE_ASAP | typeof CUTOVER_MODE_SCHEDULED | typeof CUTOVER_MODE_INHERIT;

export { CUTOVER_MODE_ASAP, CUTOVER_MODE_INHERIT, CUTOVER_MODE_SCHEDULED };

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
  isInheritAllowed: boolean,
): UseCutoverFormStateResult => {
  const hasExistingCutover = Boolean(existingCutoverValue);
  const initialCutoverDate = getInitialCutoverDate(existingCutoverValue);

  const [cutoverDate, setCutoverDate] = useState<string>(initialCutoverDate);
  const [time, setTime] = useState<string>(() => formatDateTo12Hours(new Date(initialCutoverDate)));
  const [cutoverMode, setCutoverMode] = useState<CutoverMode>(() =>
    getInitialCutoverMode(hasExistingCutover, existingCutoverValue, isInheritAllowed),
  );
  const [prevExistingCutoverValue, setPrevExistingCutoverValue] = useState(existingCutoverValue);

  if (existingCutoverValue !== prevExistingCutoverValue) {
    setPrevExistingCutoverValue(existingCutoverValue);
    const migrationCutoverDate = getInitialCutoverDate(existingCutoverValue);
    setCutoverDate(migrationCutoverDate);
    setTime(formatDateTo12Hours(new Date(migrationCutoverDate)));
    setCutoverMode(
      getInitialCutoverMode(Boolean(existingCutoverValue), existingCutoverValue, isInheritAllowed),
    );
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
