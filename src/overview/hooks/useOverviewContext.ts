import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { produce } from 'immer';

import { loadUserSettings } from '../utils/helpers/OverviewUserSettings';

import type { CreateOverviewContextData, CreateOverviewContextType } from './OverviewContext';

export const useOverviewContext = (): CreateOverviewContextType => {
  const userSettings = loadUserSettings('Overview');
  const hideWelcomeCardInitState = userSettings?.welcome?.hideWelcome ?? false;
  const [data, setData] = useState<CreateOverviewContextData>({
    hideWelcomeCardByContext: hideWelcomeCardInitState,
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
