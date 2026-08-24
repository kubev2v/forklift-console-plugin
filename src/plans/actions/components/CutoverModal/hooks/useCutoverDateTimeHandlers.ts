import { type FormEvent, useCallback } from 'react';

import { CUTOVER_MODE_ASAP, CUTOVER_MODE_SCHEDULED } from './useCutoverFormState';

type UseCutoverDateTimeHandlersArgs = {
  cutoverDate: string | undefined;
  cutoverMode: string;
  setCutoverDate: (date: string) => void;
  setIsDateValid: (valid: boolean) => void;
  setIsTimeValid: (valid: boolean) => void;
  setTime: (time: string) => void;
};

export type CutoverTimeChangeArgs = {
  hour?: number;
  minute?: number;
  timeInput: string;
  timeValid?: boolean;
};

type UseCutoverDateTimeHandlersResult = {
  getCutoverDateToSet: () => string;
  isScheduledInPast: (isTimeValid: boolean, isDateValid: boolean) => boolean;
  isScheduledInvalid: (isTimeValid: boolean, isDateValid: boolean) => boolean;
  onDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void;
  onTimeChange: (args: CutoverTimeChangeArgs) => void;
};

export const useCutoverDateTimeHandlers = ({
  cutoverDate,
  cutoverMode,
  setCutoverDate,
  setIsDateValid,
  setIsTimeValid,
  setTime,
}: UseCutoverDateTimeHandlersArgs): UseCutoverDateTimeHandlersResult => {
  const onDateChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string, date?: Date): void => {
      setIsDateValid(Boolean(date));
      if (!date) {
        return;
      }

      const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();
      const [year, month, day] = value.split('-').map((num: string) => parseInt(num, 10));

      updatedFromDate.setFullYear(year);
      updatedFromDate.setMonth(month - 1);
      updatedFromDate.setDate(day);

      setCutoverDate(updatedFromDate.toISOString());
    },
    [cutoverDate, setCutoverDate, setIsDateValid],
  );

  const onTimeChange = useCallback(
    ({ hour, minute, timeInput, timeValid }: CutoverTimeChangeArgs): void => {
      setTime(timeInput);
      setIsTimeValid(Boolean(timeValid) && Boolean(timeInput));

      if (!timeValid) {
        return;
      }

      const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();
      updatedFromDate.setHours(hour ?? 0);
      updatedFromDate.setMinutes(minute ?? 0);

      setCutoverDate(updatedFromDate.toISOString());
    },
    [cutoverDate, setCutoverDate, setIsTimeValid, setTime],
  );

  const isScheduledInvalid = (isTimeValid: boolean, isDateValid: boolean): boolean =>
    cutoverMode === CUTOVER_MODE_SCHEDULED && (!isTimeValid || !isDateValid);

  const isScheduledInPast = (isTimeValid: boolean, isDateValid: boolean): boolean =>
    cutoverMode === CUTOVER_MODE_SCHEDULED &&
    isDateValid &&
    isTimeValid &&
    cutoverDate !== undefined &&
    new Date(cutoverDate) < new Date();

  const getCutoverDateToSet = (): string =>
    cutoverMode === CUTOVER_MODE_ASAP ? new Date().toISOString() : (cutoverDate ?? '');

  return {
    getCutoverDateToSet,
    isScheduledInPast,
    isScheduledInvalid,
    onDateChange,
    onTimeChange,
  };
};
