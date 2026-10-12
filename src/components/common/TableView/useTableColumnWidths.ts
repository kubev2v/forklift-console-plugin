import { useCallback, useRef, useState } from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import { isEmpty } from '@utils/helpers';

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
  hasCustomColumnWidths: boolean;
  resetAllColumnWidths: () => void;
};

const getPersistedWidth = (
  savedWidth: number | undefined,
  minWidth: number,
): number | undefined => {
  if (savedWidth === undefined) {
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

  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>(widthsFromSettings);
  const [columnLayoutKey, setColumnLayoutKey] = useState(0);
  const widthOverridesRef = useRef(widthsFromSettings);

  const persistWidth = useCallback(
    (columnId: string, width: number): void => {
      const field = visibleColumns.find((col) => col.resourceFieldId === columnId);
      const minWidth = field ? getMinWidthForField(field) : DEFAULT_COLUMN_MIN_WIDTH_PX;
      const clamped = clampColumnWidth(width, minWidth);
      const next = { ...widthOverridesRef.current, [columnId]: clamped };
      widthOverridesRef.current = next;
      setWidthOverrides(next);
      saveWidthsInSettings(next);
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
    if (isEmpty(widthOverridesRef.current)) {
      return;
    }
    widthOverridesRef.current = {};
    setWidthOverrides(widthOverridesRef.current);
    clearSettings();
    setColumnLayoutKey((key) => key + 1);
  }, [clearSettings]);

  return {
    columnLayoutKey,
    getResizableProps,
    hasCustomColumnWidths: !isEmpty(widthOverrides),
    resetAllColumnWidths,
  };
};
