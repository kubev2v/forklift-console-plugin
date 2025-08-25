import { chromium, type FullConfig } from '@playwright/test';

import { ResourceManager } from './utils/ResourceManager';

const globalTeardown = async (config: FullConfig) => {
  const { baseURL, storageState } = config.projects[0].use;
  const resourceManager = new ResourceManager();
  resourceManager.loadResourcesFromFile();

  if (resourceManager.getResourceCount() === 0) {
    console.log('No resources to cleanup.');
    return;
  }

  if (!baseURL) {
    throw new Error('baseURL is not defined in Playwright config and is required for teardown');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: storageState as string,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  await page.goto(baseURL);

  try {
    await resourceManager.cleanupAll(page);
  } catch (error) {
    console.error('Error during cleanup in globalTeardown:', error);
  } finally {
    await context.close();
    await browser.close();
    console.error('Cleanup process finished.');
  }
};

export default globalTeardown;
