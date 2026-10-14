import { useContext } from 'react';

import { PageSelectionConfigContext, type PageSelectionConfigValue } from './pageSelectionContext';

export const usePageSelectionConfig = <T>(): PageSelectionConfigValue<T> => {
  const context = useContext(PageSelectionConfigContext);

  if (!context) {
    throw new Error('usePageSelectionConfig must be used within PageSelectionProvider');
  }

  return context as PageSelectionConfigValue<T>;
};
