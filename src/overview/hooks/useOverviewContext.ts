import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { produce } from 'immer';

import { TimeRangeOptions } from '../tabs/Overview/utils/timeRangeOptions';
import {
  loadOverviewSelectedRanges,
  loadUserSettings,
  saveOverviewSelectedRanges,
} from '../utils/helpers/OverviewUserSettings';

import type { CreateOverviewContextData, CreateOverviewContextType } from './OverviewContext';

export const useOverviewContext = (): CreateOverviewContextType => {
  const userSettings = useMemo(() => loadUserSettings('Overview'), []);
  const hideWelcomeCardInitState = userSettings?.welcome?.hideWelcome ?? false;
  const {
    vmMigrationsDonutSelectedRange: donutRange,
    vmMigrationsHistorySelectedRange: historyRange,
  } = loadOverviewSelectedRanges();
  const [data, setData] = useState<CreateOverviewContextData>({
    hideWelcomeCardByContext: hideWelcomeCardInitState,
    vmMigrationsDonutSelectedRange: (donutRange as TimeRangeOptions) ?? TimeRangeOptions.All,
    vmMigrationsHistorySelectedRange:
      (historyRange as TimeRangeOptions) ?? TimeRangeOptions.Last10Days,
  });

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const setValueSafe = useCallback((newValue: CreateOverviewContextData) => {
    if (mounted.current) {
      setData(newValue);
    }
  }, []);

  return useMemo(
    () => ({
      data,
      setData: (newState: CreateOverviewContextData) => {
        // Save/clear the user settings stored in local storage
        if (newState.hideWelcomeCardByContext) userSettings?.welcome?.save(true);
        else userSettings?.welcome?.clear();

        saveOverviewSelectedRanges({
          vmMigrationsDonutSelectedRange: newState.vmMigrationsDonutSelectedRange,
          vmMigrationsHistorySelectedRange: newState.vmMigrationsHistorySelectedRange,
        });

        setValueSafe(
          produce(data, (draft) => {
            Object.assign(draft, newState);
          }),
        );
      },
    }),
    [data, setValueSafe, userSettings?.welcome],
  );
};
