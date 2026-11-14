import type { SelectOptionProps } from '@patternfly/react-core';

import {
  COPY_APPLIANCE_SETTING_FIELDS,
  type CopyAppliancePlacementValues,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';

type PlacementOptions = Record<CopyApplianceSettingField, SelectOptionProps[]>;

export const isValidCopyAppliancePlacement = (
  values: CopyAppliancePlacementValues,
  options: PlacementOptions,
): boolean =>
  COPY_APPLIANCE_SETTING_FIELDS.every((field) =>
    options[field].some(
      (option) => Boolean(values[field]) && option.itemId === values[field] && !option.isDisabled,
    ),
  );
