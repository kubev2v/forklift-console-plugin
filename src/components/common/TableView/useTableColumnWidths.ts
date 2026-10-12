import { useCallback, useRef, useState } from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import { isEmpty } from '@utils/helpers';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import {
  getMinWidthForField,
  isResizableField,
  isValidColumnWidth,
  sanitizeColumnWidths,
} from './columnWidthUtils';

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

export const useTableColumnWidths = ({
  columnWidthsSettings,
  enabled,
}: UseTableColumnWidthsArgs): UseTableColumnWidthsResult => {
  const {
    clear: clearSettings = (): void => undefined,
    data: widthsFromSettings = {},
    save: saveWidthsInSettings = (): void => undefined,
  } = columnWidthsSettings ?? {};

  const persistedWidths = sanitizeColumnWidths(widthsFromSettings);
  const [resizeOverrides, setResizeOverrides] = useState<Record<string, number> | null>(null);
  const widthOverrides = resizeOverrides ?? persistedWidths;
  const [columnLayoutKey, setColumnLayoutKey] = useState(0);
  const widthOverridesRef = useRef(widthOverrides);
  widthOverridesRef.current = widthOverrides;

  const persistWidth = useCallback(
    (columnId: string, width: number): void => {
      if (!isValidColumnWidth(width)) {
        return;
      }
      const next = { ...widthOverridesRef.current, [columnId]: width };
      saveWidthsInSettings(next);
      widthOverridesRef.current = next;
      setResizeOverrides(next);
    },
    [saveWidthsInSettings],
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
      const persistedWidth = widthOverrides[columnId];
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
    clearSettings();
    widthOverridesRef.current = {};
    setResizeOverrides({});
    setColumnLayoutKey((key) => key + 1);
  }, [clearSettings]);

  return {
    columnLayoutKey,
    getResizableProps,
    hasCustomColumnWidths: !isEmpty(widthOverrides),
    resetAllColumnWidths,
  };
};
