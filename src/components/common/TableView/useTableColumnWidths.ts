import { useCallback, useEffect, useRef, useState } from 'react';

import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import { createCancellableDebounce } from '@utils/debounce';
import { isEmpty } from '@utils/helpers';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import {
  COLUMN_WIDTH_PERSIST_DEBOUNCE_MS,
  COLUMN_WIDTH_PERSIST_EVENTS,
  RESIZE_COLUMN_WIDTH_INCREMENT,
  RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT,
} from './columnWidthConstants';
import {
  getMinWidthForField,
  isResizableField,
  isValidColumnWidth,
  sanitizeColumnWidths,
} from './columnWidthUtils';

type UseTableColumnWidthsArgs = {
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
};

type UseTableColumnWidthsResult = {
  captureColumnWidths: (widths: Record<string, number>) => void;
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
  const capturedWidthsRef = useRef<Record<string, number>>({});
  widthOverridesRef.current = widthOverrides;

  const saveWidthsInSettingsRef = useRef(saveWidthsInSettings);
  saveWidthsInSettingsRef.current = saveWidthsInSettings;

  const debouncedSaveRef = useRef(
    createCancellableDebounce((next: Record<string, number>) => {
      saveWidthsInSettingsRef.current(next);
    }, COLUMN_WIDTH_PERSIST_DEBOUNCE_MS),
  );

  useEffect(() => {
    const debouncedSave = debouncedSaveRef.current;
    for (const eventType of COLUMN_WIDTH_PERSIST_EVENTS) {
      window.addEventListener(eventType, debouncedSave.flush);
    }
    return (): void => {
      for (const eventType of COLUMN_WIDTH_PERSIST_EVENTS) {
        window.removeEventListener(eventType, debouncedSave.flush);
      }
      debouncedSave.flush();
    };
  }, []);

  const captureColumnWidths = useCallback((widths: Record<string, number>): void => {
    capturedWidthsRef.current = sanitizeColumnWidths(widths);
  }, []);

  const persistWidth = useCallback((columnId: string, width: number): void => {
    if (!isValidColumnWidth(width)) {
      return;
    }
    const next = { ...capturedWidthsRef.current, ...widthOverridesRef.current, [columnId]: width };
    widthOverridesRef.current = next;
    setResizeOverrides(next);
    debouncedSaveRef.current(next);
  }, []);

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
        increment: RESIZE_COLUMN_WIDTH_INCREMENT,
        isResizable: true,
        minWidth,
        onResize: (_event, _columnId, newWidth): void => {
          persistWidth(columnId, newWidth);
        },
        resizeButtonAriaLabel: label,
        shiftIncrement: RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT,
        ...(persistedWidth === undefined ? {} : { width: persistedWidth }),
      };
    },
    [enabled, persistWidth, widthOverrides],
  );

  const resetAllColumnWidths = useCallback((): void => {
    capturedWidthsRef.current = {};
    if (isEmpty(widthOverridesRef.current)) {
      return;
    }
    debouncedSaveRef.current.cancel();
    clearSettings();
    widthOverridesRef.current = {};
    setResizeOverrides({});
    setColumnLayoutKey((key) => key + 1);
  }, [clearSettings]);

  return {
    captureColumnWidths,
    columnLayoutKey,
    getResizableProps,
    hasCustomColumnWidths: !isEmpty(widthOverrides),
    resetAllColumnWidths,
  };
};
