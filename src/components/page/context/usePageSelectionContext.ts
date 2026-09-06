import { useContext } from 'react';

import {
  PageSelectionConfigContext,
  type PageSelectionConfigValue,
  PageSelectionStateContext,
  type PageSelectionStateValue,
} from './pageSelectionContext';

export const usePageSelectionConfig = <T>(): PageSelectionConfigValue<T> => {
  const context = useContext(PageSelectionConfigContext);

  if (!context) {
    throw new Error('usePageSelectionConfig must be used within PageSelectionProvider');
  }

  return context as PageSelectionConfigValue<T>;
};

export const usePageSelectionState = (): PageSelectionStateValue => {
  const context = useContext(PageSelectionStateContext);

  if (!context) {
    throw new Error('usePageSelectionState must be used within PageSelectionProvider');
  }

  return context;
};
