import { createContext } from 'react';

import type { TimeRangeOptions } from '../tabs/Overview/utils/timeRangeOptions';

export type CreateOverviewContextData = {
  hideWelcomeCardByContext?: boolean;
  vmMigrationsDonutSelectedRange?: TimeRangeOptions;
  vmMigrationsHistorySelectedRange?: TimeRangeOptions;
};

export type CreateOverviewContextType = {
  data?: CreateOverviewContextData;
  setData: (data: CreateOverviewContextData) => void;
};

export const CreateOverviewContext = createContext<CreateOverviewContextType>({
  setData: () => undefined,
});

export const CreateOverviewContextProvider = CreateOverviewContext.Provider;
