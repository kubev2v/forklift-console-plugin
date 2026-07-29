import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { isEmpty } from '@utils/helpers';

import { defaultValuesMap } from './constants';
import {
  type EnhancedForkliftController,
  type ForkliftSettingsValues,
  SettingsFields,
} from './types';

const UNSETTABLE_ZERO_FIELDS: ReadonlySet<SettingsFields> = new Set([
  SettingsFields.AapTimeout,
  SettingsFields.VirtV2vMemsize,
  SettingsFields.VirtV2vSmp,
]);

export const getDefaultValues = (controller?: EnhancedForkliftController): ForkliftSettingsValues =>
  Object.fromEntries(
    Object.entries(defaultValuesMap).map(([key, defaultValue]) => [
      key,
      controller?.spec?.[key as SettingsFields] ?? defaultValue,
    ]),
  );

type SettingsPatch = {
  op: string;
  path: string;
  value?: string | number;
};

export const buildSettingsPatches = (
  dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>>,
  formData: ForkliftSettingsValues,
  currentSpec: Record<string, unknown> | undefined,
): SettingsPatch[] =>
  Object.keys(dirtyFields).map((key) => {
    const fieldKey = key as keyof ForkliftSettingsValues;
    const currentValue = currentSpec?.[fieldKey] as string | number | undefined;
    const newValue = formData[fieldKey];

    const isUnsettableZero = UNSETTABLE_ZERO_FIELDS.has(fieldKey) && newValue === 0;

    if (newValue === undefined || isEmpty(String(newValue)) || isUnsettableZero) {
      return { op: REMOVE, path: `/spec/${fieldKey}` };
    }

    return {
      op: currentValue === undefined ? ADD : REPLACE,
      path: `/spec/${fieldKey}`,
      value: newValue,
    };
  });
