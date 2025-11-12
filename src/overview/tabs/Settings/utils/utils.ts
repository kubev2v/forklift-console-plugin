import { defaultValuesMap } from './constants';
import type { EnhancedForkliftController, ForkliftSettingsValues, SettingsFields } from './types';

export const getDefaultValues = (controller?: EnhancedForkliftController): ForkliftSettingsValues =>
  Object.fromEntries(
    Object.entries(defaultValuesMap).map(([key, defaultValue]) => [
      key,
      controller?.spec?.[key as SettingsFields] ?? defaultValue,
    ]),
  );
