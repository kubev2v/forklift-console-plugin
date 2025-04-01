import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { produce } from 'immer';

import { loadUserSettings } from '../utils/helpers/OverviewUserSettings';

export type CreateOverviewContextData = {
  hideWelcomeCardByContext: boolean;
};

export type CreateOverviewContextType = {
  data?: CreateOverviewContextData;
  setData: (data: CreateOverviewContextData) => void;
};

export const CreateOverviewContext = createContext<CreateOverviewContextType>({
  setData: () => undefined,
});

export const CreateOverviewContextProvider = CreateOverviewContext.Provider;

/*
 * Provides value for the context via useValueHook extension point
 */
export const useOverviewContext = (): CreateOverviewContextType => {
  // Use the same approach as useSafetyFirst() hook
  // https://github.com/openshift/console/blob/9d4a9b0a01b2de64b308f8423a325f1fae5f8726/frontend/packages/console-dynamic-plugin-sdk/src/app/components/safety-first.tsx#L10
  const userSettings = loadUserSettings({ userSettingsKeySuffix: 'Overview' });
  const hideWelcomeCardInitState = userSettings?.welcome?.hideWelcome;
  const [data, setData] = useState<CreateOverviewContextData>({
    hideWelcomeCardByContext: hideWelcomeCardInitState,
  } as CreateOverviewContextData);

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const setValueSafe = useCallback((newValue) => {
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

        setValueSafe(produce(() => newState));
      },
    }),
    [data, setData],
  );
};

/* Abstraction layer to separate the code from the current data passing implementation (context).
 */
export const useCreateOverviewContext = () => useContext(CreateOverviewContext);
