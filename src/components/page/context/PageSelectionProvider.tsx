import type { ReactElement, ReactNode } from 'react';

import {
  PageSelectionConfigContext,
  type PageSelectionConfigValue,
  PageSelectionStateContext,
  type PageSelectionStateValue,
} from './pageSelectionContext';

type PageSelectionProviderProps<T> = {
  children: ReactNode;
  configValue: PageSelectionConfigValue<T>;
  stateValue: PageSelectionStateValue;
};

const PageSelectionProvider = <T,>({
  children,
  configValue,
  stateValue,
}: PageSelectionProviderProps<T>): ReactElement => (
  <PageSelectionConfigContext.Provider value={configValue as PageSelectionConfigValue<unknown>}>
    <PageSelectionStateContext.Provider value={stateValue}>
      {children}
    </PageSelectionStateContext.Provider>
  </PageSelectionConfigContext.Provider>
);

export default PageSelectionProvider;
