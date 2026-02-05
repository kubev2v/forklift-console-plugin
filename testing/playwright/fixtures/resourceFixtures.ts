import { type Page, test as base } from '@playwright/test';

import type { createPlanTestData } from '../types/test-data';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';

import {
  createPlan,
  createProvider,
  type CreateProviderOptions,
  type TestPlan,
  type TestProvider,
} from './helpers/resourceCreationHelpers';

export interface FixtureConfig {
  providerScope?: 'test' | 'worker';
  planScope?: 'test' | 'none';
  providerPrefix?: string;
  planPrefix?: string;
  skipProviderReadyWait?: boolean;
}

export interface ConfigurableResourceFixtures {
  resourceManager: ResourceManager;
  testProvider: TestProvider | undefined;
  testPlan: TestPlan | undefined;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<TestPlan>;
  createCustomProvider: (options?: CreateProviderOptions) => Promise<TestProvider>;
}
export const createResourceFixtures = (
  config: FixtureConfig = {},
): ReturnType<typeof base.extend<ConfigurableResourceFixtures>> => {
  const {
    providerScope = 'test',
    planScope = 'test',
    providerPrefix = 'test-provider',
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
