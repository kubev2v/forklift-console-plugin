import type { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { type Page, test as base } from '@playwright/test';

import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage/PlanDetailsPage';
import { ProviderDetailsPage } from '../page-objects/ProviderDetailsPage';
import { createPlanTestData, type ProviderData } from '../types/test-data';
import { getProviderConfig } from '../utils/providers';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';

type TestProvider = V1beta1Provider & {
  metadata: {
    name: string;
    namespace: string;
  };
};

type TestPlan = V1beta1Plan & {
  metadata: {
    name: string;
    namespace: string;
  };
  testData: ReturnType<typeof createPlanTestData>;
};

const createProvider = async (
  page: Page,
  resourceManager: ResourceManager,
  namePrefix = 'test-provider',
): Promise<TestProvider> => {
  const uniqueId = crypto.randomUUID();
  const providerName = `${namePrefix}-${uniqueId}`;

  const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  const providerConfig = getProviderConfig(providerKey);

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${providerKey}`);
  }
  const testProviderData: ProviderData = {
    name: providerName,
    projectName: 'openshift-mtv',
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? 'vcenter',
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
  };

  const createProviderPage = new CreateProviderPage(page, resourceManager);
  const providerDetailsPage = new ProviderDetailsPage(page);

  await createProviderPage.navigate();
  await createProviderPage.waitForWizardLoad();
  await createProviderPage.fillAndSubmit(testProviderData);
  await providerDetailsPage.waitForPageLoad();
  await providerDetailsPage.verifyProviderDetails(testProviderData);
  const provider: TestProvider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: providerName,
      namespace: 'openshift-mtv',
    },
  };

  (provider as any).testData = testProviderData;
  return provider;
};

const createPlanWithCustomData = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    sourceProvider: V1beta1Provider;
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>;
  },
): Promise<TestPlan> => {
  const { sourceProvider, customPlanData } = options;
  const defaultPlanData = createPlanTestData({
    sourceProvider: sourceProvider.metadata!.name!,
  });

  const testPlanData = customPlanData ? { ...defaultPlanData, ...customPlanData } : defaultPlanData;

  const createWizard = new CreatePlanWizardPage(page, resourceManager);
  const planDetailsPage = new PlanDetailsPage(page);

  await createWizard.navigate();
  await createWizard.waitForWizardLoad();
  await createWizard.fillAndSubmit(testPlanData);
  await planDetailsPage.verifyPlanTitle(testPlanData.planName);
  const plan: TestPlan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: testPlanData.planName,
      namespace: 'openshift-mtv',
    },
    testData: testPlanData,
  };

  return plan;
};

const createPlan = async (
  page: Page,
  resourceManager: ResourceManager,
  sourceProvider: V1beta1Provider,
): Promise<TestPlan> => {
  return createPlanWithCustomData(page, resourceManager, { sourceProvider });
};

export interface FixtureConfig {
  providerScope?: 'test' | 'worker';
  planScope?: 'test' | 'none';
  providerPrefix?: string;
  planPrefix?: string;
}

export interface ConfigurableResourceFixtures {
  resourceManager: ResourceManager;
  testProvider: TestProvider | undefined;
  testPlan: TestPlan | undefined;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<TestPlan>;
}
export const createResourceFixtures = (config: FixtureConfig = {}) => {
  const { providerScope = 'test', planScope = 'test', providerPrefix = 'test-provider' } = config;

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
                const provider = await createProvider(
                  page as Page,
                  tempResourceManager,
                  providerPrefix,
                );

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
                throw new Error(`Failed to create or use provider: ${String(error)}`);
              }
            },
            { scope: 'worker' },
          ] as any)
        : async ({ page, resourceManager }, use) => {
            const provider = await createProvider(page, resourceManager, providerPrefix);
            await use(provider);
          },

    testPlan:
      planScope === 'none'
        ? undefined
        : async ({ page, resourceManager, testProvider }, use) => {
            if (!testProvider) {
              throw new Error('testPlan fixture requires testProvider fixture to be enabled');
            }

            const plan = await createPlan(page, resourceManager, testProvider);
            await use(plan);
          },

    createCustomPlan: async ({ page, resourceManager, testProvider }, use) => {
      const createPlanFn = async (
        customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
      ) => {
        if (!testProvider) {
          throw new Error('createCustomPlan requires testProvider fixture to be enabled');
        }
        return createPlanWithCustomData(page, resourceManager, {
          sourceProvider: testProvider,
          customPlanData,
        });
      };
      await use(createPlanFn);
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
