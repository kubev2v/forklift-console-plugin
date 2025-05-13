import { createContext } from 'react';

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
