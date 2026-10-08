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

export type TableColumnWidthContextValue = {
  columnLayoutKey: number;
  enabled: boolean;
  getResizableProps: (
    field: ResourceField,
    columnLabel: string | null,
  ) => DataViewThResizableProps | undefined;
  resetAllColumnWidths: () => void;
};

const defaultContext: TableColumnWidthContextValue = {
  columnLayoutKey: 0,
  enabled: false,
  getResizableProps: () => undefined,
  resetAllColumnWidths: (): void => undefined,
};

const TableColumnWidthContext = createContext<TableColumnWidthContextValue>(defaultContext);

type TableColumnWidthProviderProps = {
  children: ReactNode;
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
  visibleColumns: ResourceField[];
};

export const TableColumnWidthProvider: FC<TableColumnWidthProviderProps> = ({
  children,
  columnWidthsSettings,
  enabled,
  visibleColumns,
}): ReactElement => {
  const widths = useTableColumnWidths({
    columnWidthsSettings,
    enabled,
    visibleColumns,
  });

  const value = useMemo(
    (): TableColumnWidthContextValue => ({
      columnLayoutKey: widths.columnLayoutKey,
      enabled,
      getResizableProps: widths.getResizableProps,
      resetAllColumnWidths: widths.resetAllColumnWidths,
    }),
    [enabled, widths.columnLayoutKey, widths.getResizableProps, widths.resetAllColumnWidths],
  );

  return (
    <TableColumnWidthContext.Provider value={value}>{children}</TableColumnWidthContext.Provider>
  );
};

export const useTableColumnWidthContext = (): TableColumnWidthContextValue =>
  useContext(TableColumnWidthContext);
