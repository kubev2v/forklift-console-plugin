import type { FullConfig } from '@playwright/test';

import { ResourceManager } from './utils/resource-manager/ResourceManager';

const globalTeardown = async (_config: FullConfig) => {
  const resourceManager = new ResourceManager();
  resourceManager.loadResourcesFromFile();

  if (resourceManager.getResourceCount() === 0) {
    console.log('No k8s resources to cleanup in globalTeardown.');
    return;
  }

  console.log(`🧹 Global cleanup of ${resourceManager.getResourceCount()} resources...`);

  try {
    await resourceManager.cleanupAll();
  } catch (error) {
    console.error('Error during cleanup in globalTeardown:', error);
  }

  console.error('Cleanup process finished.');
};

export default globalTeardown;
