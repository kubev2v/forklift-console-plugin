import type { TimeRangeOptions } from 'src/overview/tabs/Overview/utils/timeRangeOptions';

import { saveToLocalStorage } from '@components/common/utils/localStorage';
import { parseOrClean, saveRestOrRemoveKey } from '@utils/userSettingsHelpers';

type OverviewUserSettings = {
  welcome?: WelcomeSettings;
  vmMigrationsDonutSelectedRange?: string;
  vmMigrationsHistorySelectedRange?: string;
};

type WelcomeSettings = {
  hideWelcome?: boolean;
  save: (showWelcome: boolean) => void;
  clear: () => void;
};

const getOverviewKey = () => `${process.env.PLUGIN_NAME}/Overview`;

export const saveOverviewSelectedRanges = (ranges: {
  vmMigrationsDonutSelectedRange?: TimeRangeOptions;
  vmMigrationsHistorySelectedRange?: TimeRangeOptions;
}) => {
  const key = getOverviewKey();
  const current = parseOrClean<OverviewUserSettings>(key);
  saveToLocalStorage(
    key,
    JSON.stringify({
      ...current,
      ...ranges,
    }),
  );
};

export const loadOverviewSelectedRanges = (): {
  vmMigrationsDonutSelectedRange?: string;
  vmMigrationsHistorySelectedRange?: string;
} => {
  const key = getOverviewKey();
  const { vmMigrationsDonutSelectedRange, vmMigrationsHistorySelectedRange } =
    parseOrClean<OverviewUserSettings>(key);
  return { vmMigrationsDonutSelectedRange, vmMigrationsHistorySelectedRange };
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
