import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '@components/common/utils/localStorage';

export type OverviewUserSettings = {
  welcome?: WelcomeSettings;
};

type WelcomeSettings = {
  hideWelcome: boolean;
  save: (showWelcome: boolean) => void;
  clear: () => void;
};

const parseOrClean = (key) => {
  try {
    return JSON.parse(loadFromLocalStorage(key)) ?? {};
  } catch (e) {
    removeFromLocalStorage(key);
    console.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

const saveRestOrRemoveKey = (key: string, { rest }: Record<string, Record<string, unknown>>) => {
  if (!Object.keys(rest).length) {
    removeFromLocalStorage(key);
  } else {
    saveToLocalStorage(key, JSON.stringify({ ...rest }));
  }
};

/**
 * Deserialize user settings for the overview page - welcome card
 *
 * 1. user settings are stored in local storage as JSON encoded string
 * 2. if data cannot be decoded it's removed from the local storage (auto clean-up)
 *
 * @param userSettingsKeySuffix - The key name together with PLUGIN_NAME used to load/save data.
 */
export const loadUserSettings = ({ userSettingsKeySuffix }): OverviewUserSettings => {
  const key = `${process.env.PLUGIN_NAME}/${userSettingsKeySuffix}`;
  const { hideWelcome } = parseOrClean(key);

  return {
    welcome: {
      clear: () => {
        const { hideWelcome, ...rest } = parseOrClean(key);
        saveRestOrRemoveKey(key, { hideWelcome, rest });
      },
      hideWelcome: typeof hideWelcome === 'boolean' ? hideWelcome : undefined,
      save: (hideWelcome) => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), hideWelcome }));
      },
    },
  };
};
