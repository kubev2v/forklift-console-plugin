import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';

import {
  COPY_APPLIANCE_SETTING_GETTERS,
  COPY_APPLIANCE_SETTING_PATH,
  type CopyAppliancePlacementValues,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';

type SettingPatch =
  | { op: typeof ADD | typeof REPLACE; path: string; value: string }
  | { op: typeof REMOVE; path: string };

export const buildCopyApplianceSettingPatch = (
  current: string | undefined,
  path: string,
  value: string,
): SettingPatch | null => {
  if (!value) {
    if (!current) {
      return null;
    }
    return { op: REMOVE, path };
  }

  return {
    op: current ? REPLACE : ADD,
    path,
    value,
  };
};

export const buildCopyAppliancePlacementPatches = (
  provider: Parameters<(typeof COPY_APPLIANCE_SETTING_GETTERS)['datastore']>[0],
  placement: CopyAppliancePlacementValues,
): SettingPatch[] =>
  (Object.keys(COPY_APPLIANCE_SETTING_PATH) as CopyApplianceSettingField[])
    .map((field) =>
      buildCopyApplianceSettingPatch(
        COPY_APPLIANCE_SETTING_GETTERS[field](provider),
        COPY_APPLIANCE_SETTING_PATH[field],
        placement[field],
      ),
    )
    .filter((patch): patch is SettingPatch => patch !== null);
