import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { MTV_NAMESPACE } from './resource-manager/constants';
import { createSecret } from './resource-manager/ResourceCreator';
import type { ResourceManager } from './resource-manager/ResourceManager';

const execFileAsync = promisify(execFile);

/**
 * True when the StorageMap CRD schema includes
 * spec.map[].offloadPlugin.vsphereXcopyConfig.dedicatedMigrationHosts
 * (backend support for MTV-6163). Older MTV builds strip the field on create.
 */
export const storageMapCrdSupportsDedicatedMigrationHosts = async (): Promise<boolean> => {
  try {
    const { stdout } = await execFileAsync(
      'oc',
      [
        'get',
        'crd',
        'storagemaps.forklift.konveyor.io',
        '-o',
        'jsonpath={.spec.versions[0].schema.openAPIV3Schema.properties.spec.properties.map.items.properties.offloadPlugin.properties.vsphereXcopyConfig.properties}',
      ],
      { timeout: 30_000 },
    );
    return stdout.includes('dedicatedMigrationHosts');
  } catch {
    return false;
  }
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
