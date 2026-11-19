import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1Provider } from '@forklift-ui/types';

type ProviderSettingPatch =
  | {
      op: typeof ADD | typeof REPLACE;
      path: string;
      value: Record<string, string> | string;
    }
  | { op: typeof REMOVE; path: string };

const SETTINGS_PATH = '/spec/settings';

export const buildProviderSettingPatch = (
  provider: V1beta1Provider,
  key: string,
  value: string | undefined,
): ProviderSettingPatch[] => {
  const desiredValue = value?.trim() ?? '';
  const path = `${SETTINGS_PATH}/${key}`;
  const settings = provider?.spec?.settings;

  if (!settings) {
    return desiredValue ? [{ op: ADD, path: SETTINGS_PATH, value: { [key]: desiredValue } }] : [];
  }

  const currentValue = settings[key];

  if (currentValue === desiredValue) {
    return [];
  }

  if (!desiredValue) {
    return currentValue === undefined ? [] : [{ op: REMOVE, path }];
  }

  return [{ op: currentValue === undefined ? ADD : REPLACE, path, value: desiredValue }];
};
