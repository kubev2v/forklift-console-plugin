import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1Provider } from '@forklift-ui/types';
import { getAnnotations } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import type { DiskTransferValues } from './types';

type DiskTransferPatch =
  | { op: typeof ADD | typeof REPLACE; path: string; value: Record<string, string> | string }
  | { op: typeof REMOVE; path: string };

const SETTINGS_PATH = '/spec/settings';
const ANNOTATIONS_PATH = '/metadata/annotations';
const METHOD_PATH = `${ANNOTATIONS_PATH}/${DISK_TRANSFER_METHOD_ANNOTATION.split('/').join('~1')}`;

const getSettings = (provider: V1beta1Provider): Record<string, string> | undefined =>
  provider.spec?.settings;

const getDesiredSettings = (values: DiskTransferValues): Record<string, string | undefined> => {
  const isAppliance = values.method === VddkSetupMode.CopyAppliance;
  const isVddk = values.method === VddkSetupMode.Manual || values.method === VddkSetupMode.Upload;

  return {
    copyApplianceDatastore: isAppliance ? values.placement.datastore : undefined,
    copyApplianceFolder: isAppliance ? values.placement.folder : undefined,
    copyApplianceNetwork: isAppliance ? values.placement.network : undefined,
    copyApplianceResourcePool: isAppliance ? values.placement.resourcePool : undefined,
    useVddkAioOptimization: isVddk && values.aioEnabled ? 'true' : undefined,
    vddkInitImage: isVddk ? values.vddkImage.trim() : undefined,
  };
};

export const buildDiskTransferProviderPatches = (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): DiskTransferPatch[] => {
  const patches: DiskTransferPatch[] = [];
  const currentSettings = getSettings(provider);
  const desiredSettings = getDesiredSettings(values);

  if (currentSettings) {
    for (const [key, value] of Object.entries(desiredSettings)) {
      const currentValue = currentSettings[key];
      if (currentValue !== value) {
        const path = `${SETTINGS_PATH}/${key}`;
        if (value) {
          patches.push({ op: key in currentSettings ? REPLACE : ADD, path, value });
        } else if (key in currentSettings) {
          patches.push({ op: REMOVE, path });
        }
      }
    }
  } else {
    const newSettings: Record<string, string> = {};
    for (const [key, value] of Object.entries(desiredSettings)) {
      if (value) {
        newSettings[key] = value;
      }
    }
    if (!isEmpty(newSettings)) {
      patches.push({ op: ADD, path: SETTINGS_PATH, value: newSettings });
    }
  }

  const annotations = getAnnotations(provider);
  const currentMethod = annotations?.[DISK_TRANSFER_METHOD_ANNOTATION];
  const desiredMethod =
    values.method === VddkSetupMode.CopyAppliance ? VddkSetupMode.CopyAppliance : undefined;

  if (desiredMethod && currentMethod !== desiredMethod) {
    patches.push(
      annotations
        ? {
            op: currentMethod === undefined ? ADD : REPLACE,
            path: METHOD_PATH,
            value: desiredMethod,
          }
        : {
            op: ADD,
            path: ANNOTATIONS_PATH,
            value: { [DISK_TRANSFER_METHOD_ANNOTATION]: desiredMethod },
          },
    );
  } else if (!desiredMethod && currentMethod !== undefined) {
    patches.push({ op: REMOVE, path: METHOD_PATH });
  }

  return patches;
};
