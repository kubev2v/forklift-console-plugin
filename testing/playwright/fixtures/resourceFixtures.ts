import { existsSync } from 'node:fs';

import { type Browser, type BrowserContext, test as base } from '@playwright/test';

import type { createPlanTestData } from '../types/test-data';
import { AUTH_FILE } from '../utils/constants';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';
import { testError } from '../utils/testLog';
import { waitForProviderDeepInspectionsTerminal } from '../utils/waitForConversionsTerminal';

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

const createAuthenticatedContext = (browser: Browser): Promise<BrowserContext> => {
  return browser.newContext({
    ignoreHTTPSErrors: true,
    storageState: existsSync(AUTH_FILE) ? AUTH_FILE : undefined,
  });
};

export type FixtureConfig = {
  networkMapPrefix?: string;
  networkMapScope?: 'test' | 'none';
  planScope?: 'test' | 'none';
  providerPrefix?: string;
  providerScope?: 'test' | 'worker' | 'none';
  skipProviderReadyWait?: boolean;
  storageMapPrefix?: string;
  storageMapScope?: 'test' | 'none';
};

export type ConfigurableResourceFixtures = {
  createCustomNetworkMap: (options?: Partial<CreateNetworkMapOptions>) => Promise<TestNetworkMap>;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<TestPlan>;
  createCustomProvider: (options?: CreateProviderOptions) => Promise<TestProvider>;
  createCustomStorageMap: (options?: Partial<CreateStorageMapOptions>) => Promise<TestStorageMap>;
  resourceManager: ResourceManager;
  testNetworkMap: TestNetworkMap | undefined;
  testPlan: TestPlan | undefined;
  testProvider: TestProvider | undefined;
  testStorageMap: TestStorageMap | undefined;
};

type TestProviderFixtureFn = (
  args: {
    page: Awaited<ReturnType<Browser['newPage']>>;
    resourceManager: ResourceManager;
  },
  use: (provider: TestProvider) => Promise<void>,
) => Promise<void>;

type TestProviderWorkerFixture = [
  (args: { browser: Browser }, use: (provider: TestProvider) => Promise<void>) => Promise<void>,
  { scope: 'worker' },
];

type TestProviderFixtureResult = undefined | TestProviderWorkerFixture | TestProviderFixtureFn;

const buildTestProviderFixture = (
  providerScope: NonNullable<FixtureConfig['providerScope']>,
  providerPrefix: string,
  skipProviderReadyWait: boolean,
): TestProviderFixtureResult => {
  if (providerScope === 'none') {
    return undefined;
  }

  if (providerScope === 'worker') {
    const workerFixture: TestProviderWorkerFixture = [
      async ({ browser }, use) => {
        const context = await createAuthenticatedContext(browser);
        const page = await context.newPage();
        const tempResourceManager = new ResourceManager();

        const cleanupWorkerResources = async (): Promise<void> => {
          await context.close().catch(() => undefined);
          await tempResourceManager.cleanupAll().catch(testError);
        };

        const createWorkerProvider = async (): Promise<TestProvider> => {
          try {
            const createdProvider = await createProvider(page, tempResourceManager, {
              namePrefix: providerPrefix,
              skipProviderReadyWait,
            });
            if (!createdProvider) {
              throw new Error('Failed to create provider');
            }
            return createdProvider;
          } catch (error: unknown) {
            await cleanupWorkerResources();
            throw new Error(`Failed to create provider: ${String(error)}`, {
              cause: error,
            });
          }
        };

        const created = await createWorkerProvider();

        await use(created);
        await context.close().catch(() => undefined);
        // DeepInspection may still be RemovingSnapshot after the UI shows completed;
        // deleting the provider Secret first fails the Conversion (secret not found).
        // Fail hard if Conversions never go terminal — do not soft-skip into cleanup.
        const providerName = created.metadata?.name;
        if (providerName) {
          await waitForProviderDeepInspectionsTerminal(providerName);
        }
        await tempResourceManager.cleanupAll().catch(testError);
      },
      { scope: 'worker' },
    ];

    return workerFixture;
  }

  return async ({ page, resourceManager }, use) => {
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
    networkMapPrefix = 'test-network-map',
    networkMapScope = 'none',
    planScope = 'test',
    providerPrefix = 'test-provider',
    providerScope = 'test',
    skipProviderReadyWait = false,
    storageMapPrefix = 'test-storage-map',
    storageMapScope = 'none',
  } = config;

  return base.extend<ConfigurableResourceFixtures>({
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

    createCustomPlan: async ({ page, resourceManager, testProvider }, use) => {
      const createPlanFn = async (
        customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
      ) => {
        if (!testProvider) {
          throw new Error('createCustomPlan requires testProvider fixture to be enabled');
        }
        return createPlan(page, resourceManager, {
          customPlanData,
          sourceProvider: testProvider,
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

    resourceManager: async ({ page: _page }, use) => {
      const manager = new ResourceManager();
      await use(manager);
      await manager.cleanupAll();
    },

    testNetworkMap:
      networkMapScope === 'none'
        ? undefined
        : async ({ resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testNetworkMap fixture requires testProvider fixture to be enabled');
            }

            const networkMap = await createNetworkMap(resourceManager, {
              namePrefix: networkMapPrefix,
              sourceProvider: testProvider,
            });
            await use(networkMap);
          },

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

    testProvider: buildTestProviderFixture(providerScope, providerPrefix, skipProviderReadyWait),

    testStorageMap:
      storageMapScope === 'none'
        ? undefined
        : async ({ resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testStorageMap fixture requires testProvider fixture to be enabled');
            }

            const storageMap = await createStorageMap(resourceManager, {
              namePrefix: storageMapPrefix,
              sourceProvider: testProvider,
            });
            await use(storageMap);
          },
  });
};

export const sharedProviderFixtures = createResourceFixtures({
  planScope: 'test',
  providerPrefix: 'test-shared-provider',
  providerScope: 'worker',
});

export const sharedProviderCustomPlanFixtures = createResourceFixtures({
  planScope: 'none',
  providerPrefix: 'test-shared-provider',
  providerScope: 'worker',
});

export const isolatedFixtures = createResourceFixtures({
  planScope: 'test',
  providerPrefix: 'test-isolated-provider',
  providerScope: 'test',
});

export const isolatedCustomPlanFixtures = createResourceFixtures({
  planScope: 'none',
  providerPrefix: 'test-isolated-provider',
  providerScope: 'test',
});

export const providerOnlyFixtures = createResourceFixtures({
  planScope: 'none',
  providerPrefix: 'test-provider-only',
  providerScope: 'test',
});

export const customProviderOnlyFixtures = createResourceFixtures({
  planScope: 'none',
  providerScope: 'none',
});

export const sharedProviderNetworkMapFixtures = createResourceFixtures({
  networkMapPrefix: 'test-network-map',
  networkMapScope: 'test',
  planScope: 'none',
  providerPrefix: 'test-shared-provider',
  providerScope: 'worker',
});

export const isolatedNetworkMapFixtures = createResourceFixtures({
  networkMapPrefix: 'test-network-map',
  networkMapScope: 'test',
  planScope: 'none',
  providerPrefix: 'test-isolated-provider',
  providerScope: 'test',
});

export const sharedProviderStorageMapFixtures = createResourceFixtures({
  planScope: 'none',
  providerPrefix: 'test-shared-provider',
  providerScope: 'worker',
  storageMapPrefix: 'test-storage-map',
  storageMapScope: 'test',
});

export const isolatedStorageMapFixtures = createResourceFixtures({
  planScope: 'none',
  providerPrefix: 'test-isolated-provider',
  providerScope: 'test',
  storageMapPrefix: 'test-storage-map',
  storageMapScope: 'test',
});
