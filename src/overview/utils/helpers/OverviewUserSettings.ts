import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '@components/common/utils/localStorage';
import { MTVConsole } from '@utils/console';
import { isEmpty } from '@utils/helpers';

type OverviewUserSettings = {
  welcome?: WelcomeSettings;
};

type WelcomeSettings = {
  hideWelcome?: boolean;
  save: (showWelcome: boolean) => void;
  clear: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const parseOrClean = <T>(key: string): T => {
  try {
    const storedValue = loadFromLocalStorage(key) ?? '';
    return JSON.parse(storedValue) as T;
  } catch (_e) {
    removeFromLocalStorage(key);
    MTVConsole.error(`Removed invalid key [${key}] from local storage`);
  }
  return {} as T;
};

const saveRestOrRemoveKey = (key: string, { rest }: Record<string, Record<string, unknown>>) => {
  if (isEmpty(Object.keys(rest))) {
    removeFromLocalStorage(key);
    return;
  }
  saveToLocalStorage(key, JSON.stringify({ ...rest }));
};

/**
 * Deserialize user settings for the overview page - welcome card
 *
 * 1. user settings are stored in local storage as JSON encoded string
 * 2. if data cannot be decoded it's removed from the local storage (auto clean-up)
 *
 * @param userSettingsKeySuffix - The key name together with PLUGIN_NAME used to load/save data.
 */
export const loadUserSettings = (userSettingsKeySuffix: string): OverviewUserSettings => {
  const key = `${process.env.PLUGIN_NAME}/${userSettingsKeySuffix}`;
  const { hideWelcome, ...rest } = parseOrClean<WelcomeSettings>(key);

  return {
    welcome: {
      clear: () => {
        saveRestOrRemoveKey(key, { hideWelcome: { hideWelcome }, rest });
      },
      hideWelcome: typeof hideWelcome === 'boolean' ? hideWelcome : undefined,
      save: (hide) => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), hideWelcome: hide }));
      },
    },
  };
};
