import { DEFAULT_PER_PAGE } from '@components/common/Page/usePagination';
import { MTVConsole } from '@utils/console';
import { isEmpty } from '@utils/helpers';

import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';

import type { UserSettings } from './types';

type StoredUserSettings = {
  fields?: unknown;
  filters?: Record<string, unknown>;
  perPage?: unknown;
};

const parseOrClean = (key: string): StoredUserSettings => {
  try {
    const storedData = loadFromLocalStorage(key);
    if (!storedData) {
      return {};
    }
    return (JSON.parse(storedData) ?? {}) as StoredUserSettings;
  } catch (_e) {
    removeFromLocalStorage(key);
    MTVConsole.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

const saveRestOrRemoveKey = (key: string, rest: StoredUserSettings): void => {
  if (isEmpty(Object.keys(rest))) {
    removeFromLocalStorage(key);
  } else {
    saveToLocalStorage(key, JSON.stringify(rest));
  }
};

const toField = ({
  isVisible,
  resourceFieldId,
}: {
  isVisible?: boolean;
  resourceFieldId: string;
}): { isVisible?: boolean; resourceFieldId: string } => ({ isVisible, resourceFieldId });

const sanitizeFields = (fields: unknown): { isVisible?: boolean; resourceFieldId: string }[] =>
  Array.isArray(fields)
    ? fields
        // array should contain objects
        .filter((it) => it && typeof it === 'object')
        // cherry-pick desired props
        .map(toField)
        // verify that ID is string
        .filter(({ resourceFieldId }) => resourceFieldId && typeof resourceFieldId === 'string')
    : [];

/**
 * Deserialize user settings for a StandardPage component with provided page ID.
 *
 * 1. user settings are stored in local storage as JSON encoded string
 * 2. if data cannot be decoded it's removed from the local storage (auto clean-up)
 *
 * @param pageId key suffix - together with PLUGIN_NAME used to load/save data.
 */
export const loadUserSettings = ({ pageId }: { pageId: string }): UserSettings => {
  const key = `${process.env.PLUGIN_NAME}/${pageId}`;
  const { fields, filters, perPage } = parseOrClean(key);

  return {
    fields: {
      clear: (): void => {
        const { fields: _keyFields, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, rest);
      },
      data: sanitizeFields(fields),
      save: (newFields): void => {
        saveToLocalStorage(
          key,
          JSON.stringify({ ...parseOrClean(key), fields: newFields.map(toField) }),
        );
      },
    },
    filters: {
      clear: (): void => {
        const { filters: _keyFilters, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, rest);
      },
      data: filters ?? {},
      save: (newFilters): void => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), filters: newFilters }));
      },
    },
    pagination: {
      clear: (): void => {
        const { perPage: _keyPerPage, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, rest);
      },
      perPage: typeof perPage === 'number' ? perPage : DEFAULT_PER_PAGE,
      save: (newPerPage): void => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), perPage: newPerPage }));
      },
    },
  };
};
