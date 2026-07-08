import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceFetcher } from '../../utils/resource-manager/ResourceFetcher';
import type { JsonPatchOperation } from '../../utils/resource-manager/ResourceManager';
import { ResourcePatcher } from '../../utils/resource-manager/ResourcePatcher';

const FIELD_MAP = {
  aapTokenSecretName: 'aap_token_secret_name',
  aapUrl: 'aap_url',
  controllerMemoryLimit: 'controller_container_limits_memory',
  cpuLimit: 'controller_container_limits_cpu',
  inventoryMemoryLimit: 'inventory_container_limits_memory',
  maxVmInFlight: 'controller_max_vm_inflight',
  precopyInterval: 'controller_precopy_interval',
  snapshotPollingInterval: 'controller_snapshot_status_check_rate_seconds',
} as const;

export const KNOWN_SETTINGS = {
  aapTokenSecretName: '',
  aapUrl: '',
  controllerMemoryLimit: '800Mi',
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
    console.error('No ForkliftController found');
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
      console.error('Failed to initialize ForkliftController settings');
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

// Clears known ForkliftController settings for the duration of fn, then restores the
// original values regardless of outcome, logging if the restore itself fails.
export const withTemporaryForkliftSettings = async (
  fn: () => Promise<void>,
  namespace = MTV_NAMESPACE,
): Promise<void> => {
  const originalSettings = await initializeForkliftSettings(namespace);

  if (!originalSettings) {
    throw new Error('Failed to initialize ForkliftController settings for temporary override');
  }

  try {
    await fn();
  } finally {
    const restored = await restoreForkliftSettings(originalSettings, namespace);
    if (!restored) {
      console.error(
        'Failed to restore ForkliftController settings — subsequent tests may inherit incorrect state',
      );
    }
  }
};
