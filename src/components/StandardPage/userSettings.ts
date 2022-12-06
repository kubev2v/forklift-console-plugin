import { UserSettings } from '_/components/StandardPage';
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '_/utils/localStorage';

const parseOrClean = (key) => {
  try {
    return JSON.parse(loadFromLocalStorage(key)) ?? {};
  } catch (e) {
    removeFromLocalStorage(key);
    console.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

const toField = ({ id, isVisible }) => ({ id, isVisible });

const sanitizeFields = (fields: unknown): { id: string; isVisible?: boolean }[] =>
  Array.isArray(fields)
    ? fields
        // array should contain objects
        .filter((it) => it && typeof it === 'object')
        // cherry-pick desired props
        .map(toField)
        // verify that ID is string
        .filter(({ id }) => id && typeof id === 'string')
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
  const key = `${process.env.PLUGIN_NAME}-${pageId}`;
  const { fields } = parseOrClean(key);

  return {
    fields: {
      data: sanitizeFields(fields),
      save: (fields) =>
        saveToLocalStorage(
          key,
          JSON.stringify({ ...parseOrClean(key), fields: fields.map(toField) }),
        ),
      clear: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fields, ...rest } = parseOrClean(key);
        if (!Object.keys(rest).length) {
          removeFromLocalStorage(key);
        } else {
          saveToLocalStorage(JSON.stringify({ ...rest }), key);
        }
      },
    },
  };
};
