import { useCallback, useMemo, useState } from 'react';

import { parseOrClean } from '@utils/userSettingsHelpers';

import { STORAGE_KEY } from '../utils/constants';
import type { AccordionContextType, PersistedState } from '../utils/types';
import { persistValue } from '../utils/utils';

export const useAccordionContext = (): AccordionContextType => {
  const [persistedState] = useState(() => parseOrClean(STORAGE_KEY) as PersistedState);
  const [openExpansionItems, setOpenExpansionItems] = useState<string[]>(
    persistedState.openExpansionItems ?? [],
  );

  const openExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        return prev;
      }
      const newItems = [...prev, itemId];
      persistValue('openExpansionItems', newItems);
      return newItems;
    });
  }, []);

  const closeExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        const newItems = prev.filter((openId) => openId !== itemId);
        persistValue('openExpansionItems', newItems);
        return newItems;
      }
      return prev;
    });
  }, []);

  return useMemo(
    () => ({
      closeExpansionItem,
      openExpansionItem,
      openExpansionItems,
    }),
    [closeExpansionItem, openExpansionItem, openExpansionItems],
  );
};
