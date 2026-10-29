import { useCallback, useEffect, useRef, useState } from 'react';

import { createCancellableDebounce } from '@utils/debounce';
import { isEmpty } from '@utils/helpers';

import type { ColumnWidthsSettings } from '../Page/types';
import type { ResourceField } from '../utils/types';

import {
  COLUMN_WIDTH_PERSIST_DEBOUNCE_MS,
  COLUMN_WIDTH_PERSIST_EVENTS,
} from './columnWidthConstants';
import {
  areColumnWidthsEqual,
  type ColumnResizeConfig,
  getColumnResizeConfig,
  getResizableFieldIds,
  hasColumnWidthForIds,
  isValidColumnWidth,
  sanitizeColumnWidths,
} from './columnWidthUtils';

type UseTableColumnWidthsArgs = {
  columnWidthsSettings?: ColumnWidthsSettings;
  enabled: boolean;
  fields: ResourceField[];
};

type UseTableColumnWidthsResult = {
  columnLayoutKey: string;
  commitColumnWidths: (fullVisibleSnapshot: Record<string, number>) => void;
  flushPendingColumnWidths: () => void;
  getResizeConfig: (field: ResourceField, label: string | null) => ColumnResizeConfig | undefined;
  hasCustomColumnWidths: boolean;
  hasKnownColumnWidths: boolean;
  resetAllColumnWidths: () => void;
};

type ResizeOverrides = { scopeVersion: number; widths: Record<string, number> };

export const useTableColumnWidths = ({
  columnWidthsSettings,
  enabled,
  fields,
}: UseTableColumnWidthsArgs): UseTableColumnWidthsResult => {
  const scopeId = columnWidthsSettings?.scopeId;
  const persistedWidths = sanitizeColumnWidths(columnWidthsSettings?.data);
  const [resizeOverrides, setResizeOverrides] = useState<ResizeOverrides | null>(null);
  const scopeVersionRef = useRef({ id: scopeId, version: 0 });
  if (scopeVersionRef.current.id !== scopeId) {
    scopeVersionRef.current = { id: scopeId, version: scopeVersionRef.current.version + 1 };
  }
  const scopeVersion = scopeVersionRef.current.version;
  const widthOverrides =
    resizeOverrides?.scopeVersion === scopeVersion
      ? (resizeOverrides?.widths ?? persistedWidths)
      : persistedWidths;
  const [resetVersion, setResetVersion] = useState(0);
  const columnLayoutKey = JSON.stringify([scopeId, scopeVersion, resetVersion]);
  const knownIds = getResizableFieldIds(fields, false);
  const visibleIds = getResizableFieldIds(fields, true);

  const widthsRef = useRef(widthOverrides);
  const knownIdsRef = useRef(knownIds);
  const visibleIdsRef = useRef(visibleIds);
  const scopeVersionCurrentRef = useRef(scopeVersion);
  const clearRef = useRef(columnWidthsSettings?.clear);
  const saveRef = useRef(columnWidthsSettings?.save);
  widthsRef.current = widthOverrides;
  knownIdsRef.current = knownIds;
  visibleIdsRef.current = visibleIds;
  scopeVersionCurrentRef.current = scopeVersion;
  clearRef.current = columnWidthsSettings?.clear;
  saveRef.current = columnWidthsSettings?.save;

  const debouncedSaveRef = useRef(
    createCancellableDebounce(
      (widths: Record<string, number>, save: ColumnWidthsSettings['save']): void => {
        save(widths);
      },
      COLUMN_WIDTH_PERSIST_DEBOUNCE_MS,
    ),
  );
  const pendingScopeRef = useRef(scopeVersion);
  const previousScopeRef = useRef(scopeVersion);

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

  useEffect(() => {
    if (previousScopeRef.current !== scopeVersion) {
      debouncedSaveRef.current.flush();
      previousScopeRef.current = scopeVersion;
      pendingScopeRef.current = scopeVersion;
    }
  }, [scopeVersion]);

  const commitColumnWidths = useCallback((snapshot: Record<string, number>): void => {
    const visibleFieldIds = [...visibleIdsRef.current];
    if (!visibleFieldIds.every((id) => isValidColumnWidth(snapshot[id]))) {
      return;
    }
    const visibleSnapshot = Object.fromEntries(visibleFieldIds.map((id) => [id, snapshot[id]]));
    if (isEmpty(visibleSnapshot)) {
      return;
    }
    const next = { ...widthsRef.current, ...visibleSnapshot };
    if (areColumnWidthsEqual(next, widthsRef.current)) {
      return;
    }
    if (pendingScopeRef.current !== scopeVersionCurrentRef.current) {
      debouncedSaveRef.current.flush();
    }
    widthsRef.current = next;
    setResizeOverrides({ scopeVersion: scopeVersionCurrentRef.current, widths: next });
    pendingScopeRef.current = scopeVersionCurrentRef.current;
    const save = saveRef.current;
    if (save) {
      debouncedSaveRef.current(next, save);
    }
  }, []);

  const flushPendingColumnWidths = useCallback((): void => {
    debouncedSaveRef.current.flush();
  }, []);

  const getResizeConfig = useCallback(
    (field: ResourceField, label: string | null): ColumnResizeConfig | undefined =>
      getColumnResizeConfig(field, label, enabled, widthOverrides),
    [enabled, widthOverrides],
  );

  const resetAllColumnWidths = useCallback((): void => {
    if (!hasColumnWidthForIds(widthsRef.current, knownIdsRef.current)) {
      return;
    }
    if (pendingScopeRef.current !== scopeVersionCurrentRef.current) {
      debouncedSaveRef.current.flush();
    }
    clearRef.current?.();
    debouncedSaveRef.current.cancel();
    widthsRef.current = {};
    setResizeOverrides({ scopeVersion: scopeVersionCurrentRef.current, widths: {} });
    setResetVersion((key) => key + 1);
  }, []);

  return {
    columnLayoutKey,
    commitColumnWidths,
    flushPendingColumnWidths,
    getResizeConfig,
    hasCustomColumnWidths: hasColumnWidthForIds(widthOverrides, visibleIds),
    hasKnownColumnWidths: hasColumnWidthForIds(widthOverrides, knownIds),
    resetAllColumnWidths,
  };
};
