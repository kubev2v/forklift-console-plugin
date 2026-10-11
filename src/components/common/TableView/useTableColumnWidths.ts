import { useCallback, useRef, useState } from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import type { ThProps } from '@patternfly/react-table';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import { DEFAULT_COLUMN_MIN_WIDTH_PX } from './columnWidthConstants';
import {
  clampColumnWidth,
  dropAtMinimumColumnWidths,
  getMinWidthForField,
  isResizableField,
  resolveColumnWidthPx,
} from './columnWidthUtils';

type UseTableColumnWidthsArgs = {
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
  visibleColumns: ResourceField[];
};

type ColumnHeaderLayoutProps = Pick<ThProps, 'modifier' | 'style'>;

type UseTableColumnWidthsResult = {
  columnLayoutKey: number;
  getColumnHeaderLayoutProps: (
    field: ResourceField,
    visibleColumnCount: number,
  ) => ColumnHeaderLayoutProps | undefined;
  getResizableProps: (
    field: ResourceField,
    columnLabel: string | null,
  ) => DataViewThResizableProps | undefined;
  resetAllColumnWidths: () => void;
};

const getPersistedWidth = (
  savedWidth: number | undefined,
  minWidth: number,
): number | undefined => {
  if (savedWidth === undefined || savedWidth <= minWidth) {
    return undefined;
  }
  return clampColumnWidth(savedWidth, minWidth);
};

export const useTableColumnWidths = ({
  columnWidthsSettings,
  enabled,
  visibleColumns,
}: UseTableColumnWidthsArgs): UseTableColumnWidthsResult => {
  const {
    clear: clearSettings = (): void => undefined,
    data: widthsFromSettings = {},
    save: saveWidthsInSettings = (): void => undefined,
  } = columnWidthsSettings ?? {};

  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>(() =>
    dropAtMinimumColumnWidths(widthsFromSettings, visibleColumns),
  );
  const [columnLayoutKey, setColumnLayoutKey] = useState(0);

  const persistWidth = useCallback(
    (columnId: string, width: number): void => {
      const field = visibleColumns.find((col) => col.resourceFieldId === columnId);
      const minWidth = field ? getMinWidthForField(field) : DEFAULT_COLUMN_MIN_WIDTH_PX;
      const clamped = clampColumnWidth(width, minWidth);
      setWidthOverrides((prev) => {
        if (clamped <= minWidth) {
          if (!(columnId in prev)) {
            return prev;
          }
          const { [columnId]: _removed, ...next } = prev;
          saveWidthsInSettings(next);
          return next;
        }
        const next = { ...prev, [columnId]: clamped };
        saveWidthsInSettings(next);
        return next;
      });
    },
    [saveWidthsInSettings, visibleColumns],
  );
  const persistWidthRef = useRef(persistWidth);
  persistWidthRef.current = persistWidth;

  const getColumnHeaderLayoutProps = useCallback(
    (field: ResourceField, visibleColumnCount: number): ColumnHeaderLayoutProps | undefined => {
      if (!enabled || !isResizableField(field) || !field.resourceFieldId) {
        return undefined;
      }
      const columnId = field.resourceFieldId;
      const widthPx = resolveColumnWidthPx(field, visibleColumnCount, widthOverrides[columnId]);
      return {
        modifier: 'nowrap',
        style: { width: `${widthPx}px` },
      };
    },
    [enabled, widthOverrides],
  );

  const getResizableProps = useCallback(
    (field: ResourceField, columnLabel: string | null): DataViewThResizableProps | undefined => {
      if (!enabled || !isResizableField(field) || !field.resourceFieldId) {
        return undefined;
      }
      const columnId = field.resourceFieldId;
      const minWidth = getMinWidthForField(field);
      const persistedWidth = getPersistedWidth(widthOverrides[columnId], minWidth);
      const label = columnLabel ?? columnId;

      return {
        increment: 5,
        isResizable: true,
        minWidth,
        onResize: (_event, _columnId, newWidth): void => {
          persistWidthRef.current(columnId, newWidth);
        },
        resizeButtonAriaLabel: label,
        shiftIncrement: 25,
        ...(persistedWidth === undefined ? {} : { width: persistedWidth }),
      };
    },
    [enabled, widthOverrides],
  );

  const resetAllColumnWidths = useCallback((): void => {
    setWidthOverrides({});
    clearSettings();
    setColumnLayoutKey((key) => key + 1);
  }, [clearSettings]);

  return {
    columnLayoutKey,
    getColumnHeaderLayoutProps,
    getResizableProps,
    resetAllColumnWidths,
  };
};
