import { isEmpty } from '@utils/helpers';

import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';

import type { UserSettings } from './types';

const parseOrClean = (key) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(loadFromLocalStorage(key)) ?? {};
  } catch (_e) {
    removeFromLocalStorage(key);
    // eslint-disable-next-line no-console
    console.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

const saveRestOrRemoveKey = (key: string, { rest }: Record<string, Record<string, unknown>>) => {
  if (isEmpty(Object.keys(rest))) {
    removeFromLocalStorage(key);
  } else {
    saveToLocalStorage(key, JSON.stringify({ ...rest }));
  }
};

const toField = ({ isVisible, resourceFieldId }) => ({ isVisible, resourceFieldId });

const sanitizeFields = (fields: unknown): { resourceFieldId: string; isVisible?: boolean }[] =>
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
export const loadUserSettings = ({ pageId }): UserSettings => {
  const key = `${process.env.PLUGIN_NAME}/${pageId}`;
  const { fields, filters, perPage } = parseOrClean(key);

  return {
    fields: {
      clear: () => {
        const { fields: keyFields, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { fields: keyFields, rest });
      },
      data: sanitizeFields(fields),
      save: (newFields) => {
        saveToLocalStorage(
          key,
          JSON.stringify({ ...parseOrClean(key), fields: newFields.map(toField) }),
        );
      },
    },
    filters: {
      clear: () => {
        const { filters: keyFilters, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { filters: keyFilters, rest });
      },
      data: filters,
      save: (newFilters) => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), filters: newFilters }));
      },
    },
    pagination: {
      clear: () => {
        const { perPage: keyPerPage, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { perPage: keyPerPage, rest });
      },
      perPage: typeof perPage === 'number' ? perPage : undefined,
      save: (newPerPage) => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), perPage: newPerPage }));
      },
    },
  };
};
