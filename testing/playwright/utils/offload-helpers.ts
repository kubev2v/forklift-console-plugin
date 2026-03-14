import type { Page } from '@playwright/test';

import { MTV_NAMESPACE } from './resource-manager/constants';
import { createSecret } from './resource-manager/ResourceCreator';
import type { ResourceManager } from './resource-manager/ResourceManager';

/**
 * Creates an opaque secret for offload testing, registers it for cleanup,
 * and returns the generated secret name.
 */
export const createOffloadTestSecret = async (
  page: Page,
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

  await createSecret(page, secret, MTV_NAMESPACE);
  resourceManager.addSecret(secretName, MTV_NAMESPACE);

  return secretName;
};
