import { type CancellableDebouncedFn, createCancellableDebounce } from '@utils/debounce';

import type { ColumnWidthsSettings } from '../Page/types';

import {
  COLUMN_WIDTH_PERSIST_DEBOUNCE_MS,
  COLUMN_WIDTH_PERSIST_EVENTS,
} from './columnWidthConstants';

type PersistArgs = [widths: Record<string, number>, save: ColumnWidthsSettings['save']];

export type ColumnWidthsSaver = CancellableDebouncedFn<PersistArgs>;

export const createColumnWidthsSaver = (): ColumnWidthsSaver =>
  createCancellableDebounce((widths: PersistArgs[0], save: PersistArgs[1]): void => {
    try {
      save(widths);
    } catch {
      // Storage can fail (quota, storage disabled); keep the in-memory layout usable.
    }
  }, COLUMN_WIDTH_PERSIST_DEBOUNCE_MS);

export const subscribeColumnWidthPersistence = (saver: ColumnWidthsSaver): (() => void) => {
  for (const eventType of COLUMN_WIDTH_PERSIST_EVENTS) {
    window.addEventListener(eventType, saver.flush);
  }
  return (): void => {
    for (const eventType of COLUMN_WIDTH_PERSIST_EVENTS) {
      window.removeEventListener(eventType, saver.flush);
    }
    saver.flush();
  };
};
