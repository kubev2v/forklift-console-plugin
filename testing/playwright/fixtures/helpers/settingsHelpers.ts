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

export type OriginalSettings = {
  controllerName: string;
  values: Partial<Record<SettingsKey, string | number>>;
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

  const original: OriginalSettings = { controllerName, values: {} };
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
  const patches: JsonPatchOperation[] = (Object.keys(KNOWN_SETTINGS) as SettingsKey[]).map(
    (key) => {
      const specField = FIELD_MAP[key];
      const value = original.values[key];
      return value === undefined
        ? { op: 'remove' as const, path: `/spec/${specField}` }
        : { op: 'replace' as const, path: `/spec/${specField}`, value };
    },
  );

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
