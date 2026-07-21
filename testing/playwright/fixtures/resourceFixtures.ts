import { existsSync } from 'node:fs';

import { type Browser, type BrowserContext, test as base } from '@playwright/test';

import type { createPlanTestData } from '../types/test-data';
import { AUTH_FILE } from '../utils/constants';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';

import {
  createNetworkMap,
  type CreateNetworkMapOptions,
  createPlan,
  createProvider,
  type CreateProviderOptions,
  createStorageMap,
  type CreateStorageMapOptions,
  type TestNetworkMap,
  type TestPlan,
  type TestProvider,
  type TestStorageMap,
} from './helpers/resourceCreationHelpers';

const createAuthenticatedContext = async (browser: Browser): Promise<BrowserContext> => {
  return browser.newContext({
    ignoreHTTPSErrors: true,
    storageState: existsSync(AUTH_FILE) ? AUTH_FILE : undefined,
  });
};

export type FixtureConfig = {
  providerScope?: 'test' | 'worker' | 'none';
  planScope?: 'test' | 'none';
  networkMapScope?: 'test' | 'none';
  storageMapScope?: 'test' | 'none';
  providerPrefix?: string;
  networkMapPrefix?: string;
  storageMapPrefix?: string;
  skipProviderReadyWait?: boolean;
};

export type ConfigurableResourceFixtures = {
  resourceManager: ResourceManager;
  testProvider: TestProvider | undefined;
  testPlan: TestPlan | undefined;
  testNetworkMap: TestNetworkMap | undefined;
  testStorageMap: TestStorageMap | undefined;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<TestPlan>;
  createCustomProvider: (options?: CreateProviderOptions) => Promise<TestProvider>;
  createCustomNetworkMap: (options?: Partial<CreateNetworkMapOptions>) => Promise<TestNetworkMap>;
  createCustomStorageMap: (options?: Partial<CreateStorageMapOptions>) => Promise<TestStorageMap>;
};

const buildTestProviderFixture = (
  providerScope: NonNullable<FixtureConfig['providerScope']>,
  providerPrefix: string,
  skipProviderReadyWait: boolean,
) => {
  if (providerScope === 'none') {
    return undefined;
  }

  if (providerScope === 'worker') {
    return [
      async ({ browser }: { browser: Browser }, use: (provider: TestProvider) => Promise<void>) => {
        const context = await createAuthenticatedContext(browser);
        const page = await context.newPage();
        const tempResourceManager = new ResourceManager();

        // Promise chaining keeps `use` outside any try block (SonarCloud S6440
        // treats any `use()` call inside try as a React Hook violation). On
        // creation failure the .catch() handler cleans up and rethrows so
        // `use` is never reached. On success, Playwright worker fixtures
        // return from `use` normally once all worker tests complete — test
        // failures are handled by the runner, not propagated here as
        // exceptions — so sequential cleanup after `use` is safe.
        const created = await createProvider(page, tempResourceManager, {
          namePrefix: providerPrefix,
          skipProviderReadyWait,
        })
          .then((result) => {
            if (!result) throw new Error('Failed to create provider');
            return result;
          })
          .catch(async (error: unknown) => {
            await context.close().catch(() => undefined);
            await tempResourceManager.cleanupAll().catch(console.error);
            throw new Error(`Failed to create provider: ${String(error)}`, {
              cause: error,
            });
          });

        await use(created);
        await context.close().catch(() => undefined);
        await tempResourceManager.cleanupAll().catch(console.error);
      },
      { scope: 'worker' },
    ] as any;
  }

  return async (
    {
      page,
      resourceManager,
    }: {
      page: Awaited<ReturnType<Browser['newPage']>>;
      resourceManager: ResourceManager;
    },
    use: (provider: TestProvider) => Promise<void>,
  ) => {
    const provider = await createProvider(page, resourceManager, {
      namePrefix: providerPrefix,
      skipProviderReadyWait,
    });
    await use(provider);
  };
};

export const createResourceFixtures = (
  config: FixtureConfig = {},
): ReturnType<typeof base.extend<ConfigurableResourceFixtures>> => {
  const {
    providerScope = 'test',
    planScope = 'test',
    networkMapScope = 'none',
    storageMapScope = 'none',
    providerPrefix = 'test-provider',
    networkMapPrefix = 'test-network-map',
    storageMapPrefix = 'test-storage-map',
    skipProviderReadyWait = false,
  } = config;

  return base.extend<ConfigurableResourceFixtures>({
    resourceManager: async ({ page: _page }, use) => {
      const manager = new ResourceManager();
      await use(manager);
      await manager.cleanupAll();
    },

    testProvider: buildTestProviderFixture(providerScope, providerPrefix, skipProviderReadyWait),

    testPlan:
      planScope === 'none'
        ? undefined
        : async ({ page, resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testPlan fixture requires testProvider fixture to be enabled');
            }

            const plan = await createPlan(page, resourceManager, { sourceProvider: testProvider });
            await use(plan);
          },

    createCustomPlan: async ({ page, resourceManager, testProvider }, use) => {
      const createPlanFn = async (
        customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
      ) => {
        if (!testProvider) {
          throw new Error('createCustomPlan requires testProvider fixture to be enabled');
        }
        return createPlan(page, resourceManager, {
          sourceProvider: testProvider,
          customPlanData,
        });
      };
      await use(createPlanFn);
    },

    createCustomProvider: async ({ page, resourceManager }, use) => {
      const createCustomProviderFn = async (options?: CreateProviderOptions) => {
        return createProvider(page, resourceManager, options);
      };
      await use(createCustomProviderFn);
    },

    testNetworkMap:
      networkMapScope === 'none'
        ? undefined
        : async ({ resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testNetworkMap fixture requires testProvider fixture to be enabled');
            }

            const networkMap = await createNetworkMap(resourceManager, {
              sourceProvider: testProvider,
              namePrefix: networkMapPrefix,
            });
            await use(networkMap);
          },

    createCustomNetworkMap: async ({ resourceManager, testProvider }, use) => {
      const createNetworkMapFn = async (options?: Partial<CreateNetworkMapOptions>) => {
        if (!testProvider) {
          throw new Error('createCustomNetworkMap requires testProvider fixture to be enabled');
        }
        return createNetworkMap(resourceManager, {
          sourceProvider: testProvider,
          ...options,
        });
      };
      await use(createNetworkMapFn);
    },

    testStorageMap:
      storageMapScope === 'none'
        ? undefined
        : async ({ resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testStorageMap fixture requires testProvider fixture to be enabled');
            }

            const storageMap = await createStorageMap(resourceManager, {
              sourceProvider: testProvider,
              namePrefix: storageMapPrefix,
            });
            await use(storageMap);
          },

    createCustomStorageMap: async ({ resourceManager, testProvider }, use) => {
      const createStorageMapFn = async (options?: Partial<CreateStorageMapOptions>) => {
        if (!testProvider) {
          throw new Error('createCustomStorageMap requires testProvider fixture to be enabled');
        }
        return createStorageMap(resourceManager, {
          sourceProvider: testProvider,
          ...options,
        });
      };
      await use(createStorageMapFn);
    },
  });
};

export const sharedProviderFixtures = createResourceFixtures({
  providerScope: 'worker',
  planScope: 'test',
  providerPrefix: 'test-shared-provider',
});

export const sharedProviderCustomPlanFixtures = createResourceFixtures({
  providerScope: 'worker',
  planScope: 'none',
  providerPrefix: 'test-shared-provider',
});

export const isolatedFixtures = createResourceFixtures({
  providerScope: 'test',
  planScope: 'test',
  providerPrefix: 'test-isolated-provider',
});

export const isolatedCustomPlanFixtures = createResourceFixtures({
  providerScope: 'test',
  planScope: 'none',
  providerPrefix: 'test-isolated-provider',
});

export const providerOnlyFixtures = createResourceFixtures({
  providerScope: 'test',
  planScope: 'none',
  providerPrefix: 'test-provider-only',
});

export const customProviderOnlyFixtures = createResourceFixtures({
  providerScope: 'none',
  planScope: 'none',
});

export const sharedProviderNetworkMapFixtures = createResourceFixtures({
  providerScope: 'worker',
  planScope: 'none',
  networkMapScope: 'test',
  providerPrefix: 'test-shared-provider',
  networkMapPrefix: 'test-network-map',
});

export const isolatedNetworkMapFixtures = createResourceFixtures({
  providerScope: 'test',
  planScope: 'none',
  networkMapScope: 'test',
  providerPrefix: 'test-isolated-provider',
  networkMapPrefix: 'test-network-map',
});

export const sharedProviderStorageMapFixtures = createResourceFixtures({
  providerScope: 'worker',
  planScope: 'none',
  storageMapScope: 'test',
  providerPrefix: 'test-shared-provider',
  storageMapPrefix: 'test-storage-map',
});

export const isolatedStorageMapFixtures = createResourceFixtures({
  providerScope: 'test',
  planScope: 'none',
  storageMapScope: 'test',
  providerPrefix: 'test-isolated-provider',
  storageMapPrefix: 'test-storage-map',
});
