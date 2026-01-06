import type { TimeRangeOptions } from '../tabs/Overview/utils/timeRangeOptions';

export type OverviewContextData = {
  hideWelcomeCardByContext?: boolean;
  vmMigrationsDonutSelectedRange?: TimeRangeOptions;
  vmMigrationsHistorySelectedRange?: TimeRangeOptions;
};

export type OverviewContextType = {
  data?: OverviewContextData;
  setData: (data: OverviewContextData) => void;
};

export const createOverviewContext = (): OverviewContextType => ({
  setData: () => undefined,
});
