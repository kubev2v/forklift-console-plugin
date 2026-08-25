import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '@components/common/utils/localStorage';
import { MTVConsole } from '@utils/console';
import { isEmpty } from '@utils/helpers';

export const parseOrClean = (key: string): unknown => {
  try {
    const storedValue = loadFromLocalStorage(key) ?? '';
    return JSON.parse(storedValue) as unknown;
  } catch (_e) {
    removeFromLocalStorage(key);
    MTVConsole.error(`Removed invalid key [${key}] from local storage`);
  }
  return {};
};

export const saveRestOrRemoveKey = (
  key: string,
  { rest }: Record<string, Record<string, unknown>>,
): void => {
  if (isEmpty(Object.keys(rest))) {
    removeFromLocalStorage(key);
    return;
  }
  saveToLocalStorage(key, JSON.stringify({ ...rest }));
};
