import { type Page, test as base } from '@playwright/test';

import type { createPlanTestData } from '../types/test-data';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';

import {
  createNetworkMap,
  type CreateNetworkMapOptions,
  createPlan,
  createProvider,
  type CreateProviderOptions,
  type TestNetworkMap,
  type TestPlan,
  type TestProvider,
} from './helpers/resourceCreationHelpers';

export interface FixtureConfig {
  providerScope?: 'test' | 'worker';
  planScope?: 'test' | 'none';
  networkMapScope?: 'test' | 'none';
  providerPrefix?: string;
  planPrefix?: string;
  networkMapPrefix?: string;
  skipProviderReadyWait?: boolean;
}

export interface ConfigurableResourceFixtures {
  resourceManager: ResourceManager;
  testProvider: TestProvider | undefined;
  testPlan: TestPlan | undefined;
  testNetworkMap: TestNetworkMap | undefined;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<TestPlan>;
  createCustomProvider: (options?: CreateProviderOptions) => Promise<TestProvider>;
  createCustomNetworkMap: (options?: Partial<CreateNetworkMapOptions>) => Promise<TestNetworkMap>;
}
export const createResourceFixtures = (
  config: FixtureConfig = {},
): ReturnType<typeof base.extend<ConfigurableResourceFixtures>> => {
  const {
    providerScope = 'test',
    planScope = 'test',
    networkMapScope = 'none',
    providerPrefix = 'test-provider',
    networkMapPrefix = 'test-network-map',
    skipProviderReadyWait = false,
  } = config;

  return base.extend<ConfigurableResourceFixtures>({
    resourceManager: async ({ page: _page }, use) => {
      const manager = new ResourceManager();
      await use(manager);
      await manager.instantCleanup();
    },
    testProvider:
      providerScope === 'worker'
        ? ([
            async ({ browser }: { browser: any }, use: any) => {
              const context = await browser.newContext({ ignoreHTTPSErrors: true });
              const page = await context.newPage();
              const tempResourceManager = new ResourceManager();

              try {
                const provider = await createProvider(page as Page, tempResourceManager, {
                  namePrefix: providerPrefix,
                  skipProviderReadyWait,
                });

                if (!provider) {
                  throw new Error('Failed to create provider');
                }

                await context.close();

                await use(provider);

                const cleanupContext = await browser.newContext({ ignoreHTTPSErrors: true });
                const cleanupManager = new ResourceManager();

                try {
                  cleanupManager.addResource(provider);
                  await cleanupManager.instantCleanup();
                } finally {
                  await cleanupContext.close();
                }
              } catch (error) {
                throw new Error(`Failed to create or use provider: ${String(error)}`, {
                  cause: error,
                });
              }
            },
            { scope: 'worker' },
          ] as any)
        : async ({ page, resourceManager }, use) => {
            const provider = await createProvider(page, resourceManager, {
              namePrefix: providerPrefix,
              skipProviderReadyWait,
            });
            await use(provider);
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
        : async ({ page, resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testNetworkMap fixture requires testProvider fixture to be enabled');
            }

            const networkMap = await createNetworkMap(page, resourceManager, {
              sourceProvider: testProvider,
              namePrefix: networkMapPrefix,
            });
            await use(networkMap);
          },

    createCustomNetworkMap: async ({ page, resourceManager, testProvider }, use) => {
      const createNetworkMapFn = async (options?: Partial<CreateNetworkMapOptions>) => {
        if (!testProvider) {
          throw new Error('createCustomNetworkMap requires testProvider fixture to be enabled');
        }
        return createNetworkMap(page, resourceManager, {
          sourceProvider: testProvider,
          ...options,
        });
      };
      await use(createNetworkMapFn);
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
