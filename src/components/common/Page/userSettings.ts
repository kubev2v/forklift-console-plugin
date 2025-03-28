import { loadFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '../utils';
import { UserSettings } from './types';

const parseOrClean = (key) => {
  try {
    return JSON.parse(loadFromLocalStorage(key)) ?? {};
  } catch (e) {
    removeFromLocalStorage(key);
    console.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

const saveRestOrRemoveKey = (key: string, { rest }: { [k: string]: { [n: string]: unknown } }) => {
  if (!Object.keys(rest).length) {
    removeFromLocalStorage(key);
  } else {
    saveToLocalStorage(key, JSON.stringify({ ...rest }));
  }
};

const toField = ({ resourceFieldId, isVisible }) => ({ resourceFieldId, isVisible });

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
  const { fields, perPage, filters } = parseOrClean(key);

  return {
    fields: {
      data: sanitizeFields(fields),
      save: (fields) =>
        saveToLocalStorage(
          key,
          JSON.stringify({ ...parseOrClean(key), fields: fields.map(toField) }),
        ),
      clear: () => {
        const { fields, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { fields, rest });
      },
    },
    pagination: {
      perPage: typeof perPage === 'number' ? perPage : undefined,
      save: (perPage) => saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), perPage })),
      clear: () => {
        const { perPage, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { perPage, rest });
      },
    },
    filters: {
      data: filters,
      save: (filters) => saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), filters })),
      clear: () => {
        const { filters, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { filters, rest });
      },
    },
  };
};
