import { useMemo, useState } from 'react';

import type { PaginationSettings } from './types';

// first option in the default "per page" dropdown
export const DEFAULT_PER_PAGE = 10;

type PaginationHookProps = {
  filteredDataLength: number;
  userSettings?: PaginationSettings;
};

type PaginationHookResult = {
  itemsPerPage: number;
  lastPage: number;
  setPerPage: (perPage: number) => void;
};

export const usePagination = ({
  filteredDataLength,
  userSettings,
}: PaginationHookProps): PaginationHookResult => {
  const {
    clear: clearSavedPerPage = () => undefined,
    perPage: defaultPerPage = DEFAULT_PER_PAGE,
    save: savePerPage = () => undefined,
  } = userSettings || {};
  const [perPage, setPerPage] = useState(defaultPerPage);

  const lastPage = Math.ceil(filteredDataLength / perPage);

  const setPerPageInStateAndSettings = useMemo(
    () => (perPage: number) => {
      setPerPage(perPage);
      if (perPage !== DEFAULT_PER_PAGE) {
        savePerPage(perPage);
      } else {
        clearSavedPerPage();
      }
    },
    [setPerPage, savePerPage, clearSavedPerPage],
  );

  return {
    itemsPerPage: perPage,
    lastPage,
    setPerPage: setPerPageInStateAndSettings,
  };
};
