import type { TimeRangeOptions } from 'src/overview/tabs/Overview/utils/timeRangeOptions';

import { saveToLocalStorage } from '@components/common/utils/localStorage';
import { parseOrClean, saveRestOrRemoveKey } from '@utils/userSettingsHelpers';

type OverviewUserSettings = {
  vmMigrationsDonutSelectedRange?: string;
  vmMigrationsHistorySelectedRange?: string;
  welcome?: WelcomeSettings;
};

type WelcomeSettings = {
  clear: () => void;
  hideWelcome?: boolean;
  save: (showWelcome: boolean) => void;
};

const getOverviewKey = (): string => `${process.env.PLUGIN_NAME}/Overview`;

export const saveOverviewSelectedRanges = (ranges: {
  vmMigrationsDonutSelectedRange?: TimeRangeOptions;
  vmMigrationsHistorySelectedRange?: TimeRangeOptions;
}): void => {
  const key = getOverviewKey();
  const current = parseOrClean(key) as OverviewUserSettings;
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
  const { vmMigrationsDonutSelectedRange, vmMigrationsHistorySelectedRange } = parseOrClean(
    key,
  ) as OverviewUserSettings;
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
  const { hideWelcome, ...rest } = parseOrClean(key) as WelcomeSettings;

  return {
    welcome: {
      clear: (): void => {
        saveRestOrRemoveKey(key, { hideWelcome: { hideWelcome }, rest });
      },
      hideWelcome: typeof hideWelcome === 'boolean' ? hideWelcome : undefined,
      save: (hide): void => {
        saveToLocalStorage(
          key,
          JSON.stringify({ ...(parseOrClean(key) as OverviewUserSettings), hideWelcome: hide }),
        );
      },
    },
  };
};
