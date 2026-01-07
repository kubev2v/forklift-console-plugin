import type { Page } from '@playwright/test';

import { NavigationHelper } from '../../utils/NavigationHelper';
import { NAD_API_VERSION, RESOURCE_KINDS } from '../../utils/resource-manager/constants';
import type { V1NetworkAttachmentDefinition } from '../../utils/resource-manager/ResourceCreator';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

export type TestNad = V1NetworkAttachmentDefinition & {
  metadata: {
    name: string;
    namespace: string;
  };
};

export const createTestNad = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    name?: string;
    namespace: string;
    bridgeName?: string;
  },
): Promise<TestNad> => {
  const { namespace, bridgeName = 'br0' } = options;
  const nadName = options.name ?? `nad-test-${crypto.randomUUID().slice(0, 8)}`;

  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  const nadConfig = {
    cniVersion: '0.3.1',
    name: nadName,
    type: 'bridge',
    bridge: bridgeName,
    ipam: {},
  };

  const nad: V1NetworkAttachmentDefinition = {
    apiVersion: NAD_API_VERSION,
    kind: RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION,
    metadata: {
      name: nadName,
      namespace,
    },
    spec: {
      config: JSON.stringify(nadConfig),
    },
  };

  const createdNad = await resourceManager.createNad(page, nad, namespace);
  if (!createdNad) {
    throw new Error(`Failed to create NAD ${nadName}`);
  }

  resourceManager.addNad(nadName, namespace);

  const result: TestNad = {
    ...createdNad,
    metadata: {
      ...createdNad.metadata,
      name: nadName,
      namespace,
    },
  };

  return result;
};
