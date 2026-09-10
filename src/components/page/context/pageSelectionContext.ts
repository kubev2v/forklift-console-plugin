import { createContext, type FC, type MutableRefObject } from 'react';

import type { RowProps } from '@components/common/TableView/types';

export type PageSelectionConfigValue<T> = {
  canSelectRef: MutableRefObject<((item: T) => boolean) | undefined>;
  cellRef: MutableRefObject<FC<RowProps<T>> | undefined>;
  getSelectDisabledReasonRef: MutableRefObject<((item: T) => string | undefined) | undefined>;
  hasExpansion: boolean;
  hasSelection: boolean;
  toggleExpandForRef: MutableRefObject<(items: T[]) => void>;
  toggleSelectForRef: MutableRefObject<(items: T[]) => void>;
  toIdRef: MutableRefObject<((item: T) => string) | undefined>;
};

export type PageSelectionStateValue = {
  expandedIds?: string[];
  selectedIds?: string[];
};

export const PageSelectionConfigContext = createContext<PageSelectionConfigValue<unknown> | null>(
  null,
);

export const PageSelectionStateContext = createContext<PageSelectionStateValue | null>(null);
