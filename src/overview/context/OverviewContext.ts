import { createContext } from 'react';

import {
  createOverviewContext,
  type OverviewContextData,
  type OverviewContextType,
} from '../hooks/OverviewContext';

export type { OverviewContextData, OverviewContextType };
export { createOverviewContext };

export const OverviewContext = createContext<OverviewContextType>(createOverviewContext());
export const OverviewContextProvider = OverviewContext.Provider;
