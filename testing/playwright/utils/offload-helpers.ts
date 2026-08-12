import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { MTV_NAMESPACE } from './resource-manager/constants';
import { createSecret } from './resource-manager/ResourceCreator';
import type { ResourceManager } from './resource-manager/ResourceManager';

const execFileAsync = promisify(execFile);

const STORAGE_MAP_CRD_QUERY_TIMEOUT_MS = 30_000;

type StorageMapCrdVersion = {
  schema?: {
    openAPIV3Schema?: {
      properties?: {
        spec?: {
          properties?: {
            map?: {
              items?: {
                properties?: {
                  offloadPlugin?: {
                    properties?: {
                      vsphereXcopyConfig?: {
                        properties?: Record<string, unknown>;
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
  storage?: boolean;
};

type StorageMapCrd = {
  spec?: {
    versions?: StorageMapCrdVersion[];
  };
};

/**
 * True when the StorageMap CRD schema includes
 * spec.map[].offloadPlugin.vsphereXcopyConfig.dedicatedMigrationHosts
 * (backend support for MTV-6163). Older MTV builds strip the field on create.
 *
 * Uses the CRD version with `storage: true` (falls back to versions[0]).
 * Throws when the CRD query itself fails so broken cluster context is not
 * mistaken for an older schema.
 */
export const storageMapCrdSupportsDedicatedMigrationHosts = async (): Promise<boolean> => {
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync(
      'oc',
      ['get', 'crd', 'storagemaps.forklift.konveyor.io', '-o', 'json'],
      { timeout: STORAGE_MAP_CRD_QUERY_TIMEOUT_MS },
    ));
  } catch (error) {
    throw new Error('Cannot determine StorageMap CRD support for dedicated migration hosts', {
      cause: error,
    });
  }

  const crd = JSON.parse(stdout) as StorageMapCrd;
  const storedVersion =
    crd.spec?.versions?.find((version) => version.storage === true) ?? crd.spec?.versions?.[0];
  const properties =
    storedVersion?.schema?.openAPIV3Schema?.properties?.spec?.properties?.map?.items?.properties
      ?.offloadPlugin?.properties?.vsphereXcopyConfig?.properties;

  return Boolean(properties && 'dedicatedMigrationHosts' in properties);
};

/**
 * Creates an opaque secret for offload testing, registers it for cleanup,
 * and returns the generated secret name.
 */
export const createOffloadTestSecret = async (
  resourceManager: ResourceManager,
): Promise<string> => {
  const secretName = `vs8-secret-${crypto.randomUUID().slice(0, 8)}`;

  const secret = {
    apiVersion: 'v1' as const,
    kind: 'Secret' as const,
    metadata: { name: secretName, namespace: MTV_NAMESPACE },
    stringData: { placeholder: 'offload-test' },
    type: 'Opaque',
  };

  const createdSecret = await createSecret(secret, MTV_NAMESPACE);
  if (!createdSecret) {
    throw new Error(`Failed to create offload test secret ${secretName}`);
  }
  resourceManager.addSecret(secretName, MTV_NAMESPACE);

  return secretName;
};
