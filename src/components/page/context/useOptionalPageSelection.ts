import { useContext, useMemo } from 'react';

import {
  PageSelectionConfigContext,
  type PageSelectionConfigValue,
  PageSelectionStateContext,
  type PageSelectionStateValue,
} from './pageSelectionContext';

export const useOptionalPageSelection = <T>(): {
  config: PageSelectionConfigValue<T>;
  state: PageSelectionStateValue;
} | null => {
  const config = useContext(PageSelectionConfigContext);
  const state = useContext(PageSelectionStateContext);
  return useMemo(() => {
    if (!config || !state) {
      return null;
    }
    return { config: config as PageSelectionConfigValue<T>, state };
  }, [config, state]);
};
