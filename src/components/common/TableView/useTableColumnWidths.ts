import { useCallback, useRef, useState } from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import { DEFAULT_COLUMN_MIN_WIDTH_PX } from './columnWidthConstants';
import { clampColumnWidth, getMinWidthForField, isResizableField } from './columnWidthUtils';

type UseTableColumnWidthsArgs = {
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
  visibleColumns: ResourceField[];
};

type UseTableColumnWidthsResult = {
  columnLayoutKey: number;
  getResizableProps: (
    field: ResourceField,
    columnLabel: string | null,
  ) => DataViewThResizableProps | undefined;
  resetAllColumnWidths: () => void;
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

  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>(
    () => widthsFromSettings,
  );
  const [columnLayoutKey, setColumnLayoutKey] = useState(0);

  const persistWidth = useCallback(
    (columnId: string, width: number): void => {
      const field = visibleColumns.find((col) => col.resourceFieldId === columnId);
      const minWidth = field ? getMinWidthForField(field) : DEFAULT_COLUMN_MIN_WIDTH_PX;
      const clamped = clampColumnWidth(width, minWidth);
      setWidthOverrides((prev) => {
        const next = { ...prev, [columnId]: clamped };
        saveWidthsInSettings(next);
        return next;
      });
    },
    [saveWidthsInSettings, visibleColumns],
  );
  const persistWidthRef = useRef(persistWidth);
  persistWidthRef.current = persistWidth;

  const getResizableProps = useCallback(
    (field: ResourceField, columnLabel: string | null): DataViewThResizableProps | undefined => {
      if (!enabled || !isResizableField(field) || !field.resourceFieldId) {
        return undefined;
      }
      const columnId = field.resourceFieldId;
      const minWidth = getMinWidthForField(field);
      const savedWidth = widthOverrides[columnId];
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
        ...(savedWidth === undefined ? {} : { width: clampColumnWidth(savedWidth, minWidth) }),
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
    getResizableProps,
    resetAllColumnWidths,
  };
};
