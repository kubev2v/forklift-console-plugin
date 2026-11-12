import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1Provider } from '@forklift-ui/types';
import { getAnnotation, getAnnotations } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import {
  COPY_APPLIANCE_SETTING_FIELDS,
  COPY_APPLIANCE_SETTING_KEY,
} from '../DetailsSection/copyAppliancePlacementConfig';

import { ANNOTATIONS_PATH, METHOD_PATH, SETTINGS_PATH } from './diskTransferPatchConstants';
import type { DiskTransferPatch, DiskTransferValues } from './types';

const TEST = 'test' as const;

const getDesiredSettings = (values: DiskTransferValues): Record<string, string | undefined> => {
  const isAppliance = values.method === VddkSetupMode.CopyAppliance;
  const isVddk = values.method === VddkSetupMode.Manual || values.method === VddkSetupMode.Upload;
  const placementSettings = Object.fromEntries(
    COPY_APPLIANCE_SETTING_FIELDS.map((field) => [
      COPY_APPLIANCE_SETTING_KEY[field],
      isAppliance ? values.placement[field] : undefined,
    ]),
  );
  return {
    ...placementSettings,
    useVddkAioOptimization: isVddk && values.aioEnabled ? 'true' : undefined,
    vddkInitImage: isVddk ? values.vddkImage.trim() : undefined,
  };
};

const buildResourceVersionPatch = (provider: V1beta1Provider): DiskTransferPatch[] => {
  const resourceVersion = provider.metadata?.resourceVersion;
  return resourceVersion
    ? [{ op: TEST, path: '/metadata/resourceVersion', value: resourceVersion }]
    : [];
};

const buildSettingPatch = (
  settings: Record<string, string>,
  key: string,
  value: string | undefined,
): DiskTransferPatch[] => {
  if (settings[key] === value) {
    return [];
  }
  const path = `${SETTINGS_PATH}/${key}`;
  if (value) {
    return [{ op: key in settings ? REPLACE : ADD, path, value }];
  }
  return key in settings ? [{ op: REMOVE, path }] : [];
};

const buildSettingsPatches = (
  settings: Record<string, string> | undefined,
  values: DiskTransferValues,
): DiskTransferPatch[] => {
  const desiredSettings = getDesiredSettings(values);
  if (settings) {
    return Object.entries(desiredSettings).flatMap(([key, value]) =>
      buildSettingPatch(settings, key, value),
    );
  }
  const newSettings = Object.fromEntries(
    Object.entries(desiredSettings).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return isEmpty(newSettings) ? [] : [{ op: ADD, path: SETTINGS_PATH, value: newSettings }];
};

const buildMethodAnnotationPatches = (
  provider: V1beta1Provider,
  method: VddkSetupMode,
): DiskTransferPatch[] => {
  const currentMethod = getAnnotation(provider, DISK_TRANSFER_METHOD_ANNOTATION);
  if (method !== VddkSetupMode.CopyAppliance) {
    return currentMethod === undefined ? [] : [{ op: REMOVE, path: METHOD_PATH }];
  }
  if (currentMethod === method) {
    return [];
  }
  if (currentMethod !== undefined) {
    return [{ op: REPLACE, path: METHOD_PATH, value: method }];
  }
  if (getAnnotations(provider)) {
    return [{ op: ADD, path: METHOD_PATH, value: method }];
  }
  return [
    { op: ADD, path: ANNOTATIONS_PATH, value: { [DISK_TRANSFER_METHOD_ANNOTATION]: method } },
  ];
};

export const buildDiskTransferProviderPatches = (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): DiskTransferPatch[] => {
  const patches = [
    ...buildSettingsPatches(provider.spec?.settings, values),
    ...buildMethodAnnotationPatches(provider, values.method),
  ];
  return isEmpty(patches) ? [] : [...buildResourceVersionPatch(provider), ...patches];
};
