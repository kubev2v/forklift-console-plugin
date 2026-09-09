import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceFetcher } from '../../utils/resource-manager/ResourceFetcher';
import {
  type JsonPatchOperation,
  ResourcePatcher,
} from '../../utils/resource-manager/ResourcePatcher';
import { testError } from '../../utils/testLog';

const FIELD_MAP = {
  aapTokenSecretName: 'aap_token_secret_name',
  aapUrl: 'aap_url',
  controllerMemoryLimit: 'controller_container_limits_memory',
  controllerTransferNetwork: 'controller_transfer_network',
  cpuLimit: 'controller_container_limits_cpu',
  inventoryMemoryLimit: 'inventory_container_limits_memory',
  maxVmInFlight: 'controller_max_vm_inflight',
  precopyInterval: 'controller_precopy_interval',
  snapshotPollingInterval: 'controller_snapshot_status_check_rate_seconds',
} as const;

// CRD minimum is 1; UI "Default" means the spec key is absent (REMOVE, never 0).
const UNSET_FIELD_MAP = {
  virtV2vMemsize: 'virt_v2v_memsize',
  virtV2vSmp: 'virt_v2v_smp',
} as const;

// Empty string is the "None" baseline for controllerTransferNetwork (matches the
// UI's blank-option behavior in EditControllerTransferNetwork.tsx). Tracking it here
// ensures any NetworkAttachmentDefinition reference set during a test is cleared
// before resourceManager.cleanupAll() deletes the NAD -- otherwise the ForkliftController
// is left pointing at a deleted NAD, which makes every reconcile (including finalizer
// teardown on delete) fail permanently.
export const KNOWN_SETTINGS = {
  aapTokenSecretName: '',
  aapUrl: '',
  controllerMemoryLimit: '800Mi',
  controllerTransferNetwork: '',
  cpuLimit: '500m',
  inventoryMemoryLimit: '1000Mi',
  maxVmInFlight: 10,
  precopyInterval: 60,
  snapshotPollingInterval: 10,
} as const;

type SettingsKey = keyof typeof KNOWN_SETTINGS;
type UnsetSettingsKey = keyof typeof UNSET_FIELD_MAP;

export type OriginalSettings = {
  controllerName: string;
  unsetValues: Partial<Record<UnsetSettingsKey, number | undefined>>;
  values: Partial<Record<SettingsKey, string | number>>;
};

const buildUnsetFieldRestorePatches = (
  spec: Record<string, unknown>,
  unsetValues: OriginalSettings['unsetValues'],
): JsonPatchOperation[] => {
  const patches: JsonPatchOperation[] = [];

  for (const key of Object.keys(UNSET_FIELD_MAP) as UnsetSettingsKey[]) {
    const specField = UNSET_FIELD_MAP[key];
    const originalValue = unsetValues[key];
    const currentValue = spec[specField];

    if (originalValue === undefined) {
      if (currentValue !== undefined) {
        patches.push({ op: 'remove', path: `/spec/${specField}` });
      }
    } else if (currentValue === undefined) {
      patches.push({ op: 'add', path: `/spec/${specField}`, value: originalValue });
    } else if (currentValue !== originalValue) {
      patches.push({ op: 'replace', path: `/spec/${specField}`, value: originalValue });
    }
  }

  return patches;
};

export const initializeForkliftSettings = async (
  namespace = MTV_NAMESPACE,
): Promise<OriginalSettings | null> => {
  const controller = await ResourceFetcher.fetchForkliftController(
    'forklift-controller',
    namespace,
  );
  if (!controller) {
    testError('No ForkliftController found');
    return null;
  }

  const controllerName = controller.metadata?.name ?? 'forklift-controller';
  const spec = (controller.spec ?? {}) as Record<string, unknown>;

  const original: OriginalSettings = { controllerName, unsetValues: {}, values: {} };
  const patches: JsonPatchOperation[] = [];

  for (const key of Object.keys(KNOWN_SETTINGS) as SettingsKey[]) {
    const specField = FIELD_MAP[key];
    const currentValue = spec[specField];
    const knownValue = KNOWN_SETTINGS[key];

    original.values[key] = currentValue as string | number | undefined;

    if (currentValue !== knownValue) {
      patches.push({
        op: currentValue === undefined ? 'add' : 'replace',
        path: `/spec/${specField}`,
        value: knownValue,
      });
    }
  }

  for (const key of Object.keys(UNSET_FIELD_MAP) as UnsetSettingsKey[]) {
    const specField = UNSET_FIELD_MAP[key];
    const currentValue = spec[specField];

    original.unsetValues[key] = currentValue as number | undefined;

    if (currentValue !== undefined) {
      patches.push({ op: 'remove', path: `/spec/${specField}` });
    }
  }

  if (patches.length > 0) {
    const result = await ResourcePatcher.patchForkliftController(
      controllerName,
      patches,
      namespace,
    );
    if (!result) {
      testError('Failed to initialize ForkliftController settings');
      return null;
    }
  }

  return original;
};

export const restoreForkliftSettings = async (
  original: OriginalSettings,
  namespace = MTV_NAMESPACE,
): Promise<boolean> => {
  const controller = await ResourceFetcher.fetchForkliftController(
    original.controllerName,
    namespace,
  );
  const spec = (controller?.spec ?? {}) as Record<string, unknown>;

  const patches: JsonPatchOperation[] = (Object.keys(KNOWN_SETTINGS) as SettingsKey[]).map(
    (key) => {
      const specField = FIELD_MAP[key];
      const value = original.values[key];
      return value === undefined
        ? { op: 'remove' as const, path: `/spec/${specField}` }
        : { op: 'replace' as const, path: `/spec/${specField}`, value };
    },
  );

  patches.push(...buildUnsetFieldRestorePatches(spec, original.unsetValues));

  const result = await ResourcePatcher.patchForkliftController(
    original.controllerName,
    patches,
    namespace,
  );

  return result !== null;
};

// Clears known ForkliftController settings for the duration of testCallback, then restores the
// original values regardless of outcome, logging if the restore itself fails.
export const withTemporaryForkliftSettings = async (
  testCallback: () => Promise<void>,
  namespace = MTV_NAMESPACE,
): Promise<void> => {
  const originalSettings = await initializeForkliftSettings(namespace);

  if (!originalSettings) {
    throw new Error('Failed to initialize ForkliftController settings for temporary override');
  }

  try {
    await testCallback();
  } finally {
    const restored = await restoreForkliftSettings(originalSettings, namespace);
    if (!restored) {
      testError(
        'Failed to restore ForkliftController settings — subsequent tests may inherit incorrect state',
      );
    }
  }
};
