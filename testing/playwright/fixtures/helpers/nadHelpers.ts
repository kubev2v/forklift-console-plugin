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

/**
 * Creates a NetworkAttachmentDefinition (NAD) for testing purposes.
 *
 * NADs are used by the Settings tab's "Controller transfer network" dropdown
 * to select a network for data transfer during migrations.
 *
 * @param page - Playwright page instance (needed for CSRF token)
 * @param resourceManager - Resource manager for API calls and cleanup registration
 * @param options - Configuration options for the NAD
 * @returns Promise that resolves to the created TestNad
 *
 * @example
 * const nad = await createTestNad(page, resourceManager, {
 *   name: 'my-test-nad',
 *   namespace: 'openshift-mtv',
 * });
 */
export const createTestNad = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    /** Name for the NAD (auto-generated if not provided) */
    name?: string;
    /** Namespace for the NAD */
    namespace: string;
    /** Bridge name for the CNI config (defaults to 'br0') */
    bridgeName?: string;
  },
): Promise<TestNad> => {
  const { namespace, bridgeName = 'br0' } = options;

  // Generate NAD name if not provided
  const nadName = options.name ?? `nad-test-${crypto.randomUUID().slice(0, 8)}`;

  // Navigate to console to establish session (needed for CSRF token)
  const navigationHelper = new NavigationHelper(page);
  await navigationHelper.navigateToConsole();

  // Create the NAD with a simple bridge CNI config
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

  // Register NAD for cleanup
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
