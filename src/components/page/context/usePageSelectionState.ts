import { useContext } from 'react';

import { PageSelectionStateContext, type PageSelectionStateValue } from './pageSelectionContext';

export const usePageSelectionState = (): PageSelectionStateValue => {
  const context = useContext(PageSelectionStateContext);

  if (!context) {
    throw new Error('usePageSelectionState must be used within PageSelectionProvider');
  }

  return context;
};
