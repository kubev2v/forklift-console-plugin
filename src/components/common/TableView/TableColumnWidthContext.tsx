/* eslint-disable react-refresh/only-export-components -- context module exports the provider and the hooks that read it */
import {
  createContext,
  type FC,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import { useTableColumnWidths } from './useTableColumnWidths';

type TableColumnWidthContextValue = {
  columnLayoutKey: number;
  enabled: boolean;
  getResizableProps: (
    field: ResourceField,
    columnLabel: string | null,
  ) => DataViewThResizableProps | undefined;
  hasCustomColumnWidths: boolean;
  resetAllColumnWidths: () => void;
};

const defaultContext: TableColumnWidthContextValue = {
  columnLayoutKey: 0,
  enabled: false,
  getResizableProps: () => undefined,
  hasCustomColumnWidths: false,
  resetAllColumnWidths: (): void => undefined,
};

const TableColumnWidthContext = createContext<TableColumnWidthContextValue>(defaultContext);

type TableColumnWidthProviderProps = {
  children: ReactNode;
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
};

export const TableColumnWidthProvider: FC<TableColumnWidthProviderProps> = ({
  children,
  columnWidthsSettings,
  enabled,
}): ReactElement => {
  const { columnLayoutKey, getResizableProps, hasCustomColumnWidths, resetAllColumnWidths } =
    useTableColumnWidths({
      columnWidthsSettings,
      enabled,
    });

  const value = useMemo(
    (): TableColumnWidthContextValue => ({
      columnLayoutKey,
      enabled,
      getResizableProps,
      hasCustomColumnWidths,
      resetAllColumnWidths,
    }),
    [columnLayoutKey, enabled, getResizableProps, hasCustomColumnWidths, resetAllColumnWidths],
  );

  return (
    <TableColumnWidthContext.Provider value={value}>{children}</TableColumnWidthContext.Provider>
  );
};

export const useTableColumnWidthContext = (): TableColumnWidthContextValue =>
  useContext(TableColumnWidthContext);
