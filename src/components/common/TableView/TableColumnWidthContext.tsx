/* eslint-disable react-refresh/only-export-components -- context module exports the provider and the hooks that read it */
import {
  createContext,
  type FC,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import type { ColumnResizeConfig } from './columnWidthUtils';
import { useTableColumnWidths } from './useTableColumnWidths';

type TableColumnWidthContextValue = {
  columnLayoutKey: string;
  commitColumnWidths: (fullVisibleSnapshot: Record<string, number>) => void;
  enabled: boolean;
  flushPendingColumnWidths: () => void;
  getResizeConfig: (field: ResourceField, label: string | null) => ColumnResizeConfig | undefined;
  hasCustomColumnWidths: boolean;
  hasKnownColumnWidths: boolean;
  resetAllColumnWidths: () => void;
};

const defaultContext: TableColumnWidthContextValue = {
  columnLayoutKey: '[null,0,0]',
  commitColumnWidths: (): void => undefined,
  enabled: false,
  flushPendingColumnWidths: (): void => undefined,
  getResizeConfig: () => undefined,
  hasCustomColumnWidths: false,
  hasKnownColumnWidths: false,
  resetAllColumnWidths: (): void => undefined,
};

const TableColumnWidthContext = createContext<TableColumnWidthContextValue>(defaultContext);

type TableColumnWidthProviderProps = {
  children: ReactNode;
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
  fields: ResourceField[];
};

export const TableColumnWidthProvider: FC<TableColumnWidthProviderProps> = ({
  children,
  columnWidthsSettings,
  enabled,
  fields,
}): ReactElement => {
  const {
    columnLayoutKey,
    commitColumnWidths,
    flushPendingColumnWidths,
    getResizeConfig,
    hasCustomColumnWidths,
    hasKnownColumnWidths,
    resetAllColumnWidths,
  } = useTableColumnWidths({
    columnWidthsSettings,
    enabled,
    fields,
  });

  const value = useMemo(
    (): TableColumnWidthContextValue => ({
      columnLayoutKey,
      commitColumnWidths,
      enabled,
      flushPendingColumnWidths,
      getResizeConfig,
      hasCustomColumnWidths,
      hasKnownColumnWidths,
      resetAllColumnWidths,
    }),
    [
      columnLayoutKey,
      commitColumnWidths,
      enabled,
      flushPendingColumnWidths,
      getResizeConfig,
      hasCustomColumnWidths,
      hasKnownColumnWidths,
      resetAllColumnWidths,
    ],
  );

  return (
    <TableColumnWidthContext.Provider value={value}>{children}</TableColumnWidthContext.Provider>
  );
};

export const useTableColumnWidthContext = (): TableColumnWidthContextValue =>
  useContext(TableColumnWidthContext);
