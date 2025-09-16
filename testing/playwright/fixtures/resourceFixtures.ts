import { existsSync } from 'fs';
import { join } from 'path';

import type { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { type Page, test as base } from '@playwright/test';

import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';
import { ProviderDetailsPage } from '../page-objects/ProviderDetailsPage';
import { ProvidersListPage } from '../page-objects/ProvidersListPage';
import { createPlanTestData, type ProviderConfig, type ProviderData } from '../types/test-data';
import { ResourceManager } from '../utils/resource-manager/ResourceManager';

// Load real provider configurations
const providersPath = join(__dirname, '../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../.providers.json';

const createProvider = async (
  page: Page,
  resourceManager: ResourceManager,
  namePrefix = 'test-provider',
): Promise<V1beta1Provider> => {
  const uniqueId = crypto.randomUUID();
  const providerName = `${namePrefix}-${uniqueId}`;

  const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${providerKey}`);
  }
  const testProviderData: ProviderData = {
    name: providerName,
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? 'vcenter',
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
  };

  const providersPage = new ProvidersListPage(page);
  const createProviderPage = new CreateProviderPage(page, resourceManager);
  const providerDetailsPage = new ProviderDetailsPage(page);

  await providersPage.navigateFromMainMenu();
  await providersPage.clickCreateProviderButton();
  await createProviderPage.waitForWizardLoad();
  await createProviderPage.fillAndSubmit(testProviderData);
  await providerDetailsPage.waitForPageLoad();
  await providerDetailsPage.verifyProviderDetails(testProviderData);
  const provider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: providerName,
      namespace: 'openshift-mtv',
    },
  } as V1beta1Provider;

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
): Promise<V1beta1Plan> => {
  const namePrefix = 'test-plan';
  const uniqueId = crypto.randomUUID();
  const planName = `${namePrefix}-${uniqueId}`;
  const targetProjectName = `test-project-${uniqueId}`;
  const { sourceProvider, customPlanData } = options;
  const defaultPlanData = createPlanTestData({
    planName,
    planProject: 'openshift-mtv',
    sourceProvider: sourceProvider.metadata!.name!,
    targetProvider: 'host',
    targetProject: {
      name: targetProjectName,
      isPreexisting: false,
    },
    networkMap: {
      name: `${planName}-network-map`,
      isPreexisting: false,
    },
    storageMap: {
      name: `${planName}-storage-map`,
      isPreexisting: false,
      targetStorage: 'ocs-storagecluster-ceph-rbd-virtualization',
    },
    virtualMachines: [{ sourceName: 'mtv-func-rhel9' }],
  });

  const testPlanData = customPlanData ? { ...defaultPlanData, ...customPlanData } : defaultPlanData;

  const plansPage = new PlansListPage(page);
  const createWizard = new CreatePlanWizardPage(page, resourceManager);
  const planDetailsPage = new PlanDetailsPage(page);

  await plansPage.navigateFromMainMenu();
  await plansPage.clickCreatePlanButton();
  await createWizard.waitForWizardLoad();
  await createWizard.fillAndSubmit(testPlanData);
  await planDetailsPage.verifyPlanTitle(testPlanData.planName);
  const plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: testPlanData.planName,
      namespace: 'openshift-mtv',
    },
  } as V1beta1Plan;

  (plan as any).testData = testPlanData;
  return plan;
};

const createPlan = async (
  page: Page,
  resourceManager: ResourceManager,
  sourceProvider: V1beta1Provider,
): Promise<V1beta1Plan> => {
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
  testProvider: V1beta1Provider | undefined;
  testPlan: V1beta1Plan | undefined;
  createCustomPlan: (
    customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
  ) => Promise<V1beta1Plan>;
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
              const context = await browser.newContext();
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

                await use(provider);

                const cleanupContext = await browser.newContext();
                const cleanupManager = new ResourceManager();

                try {
                  cleanupManager.addResource(provider);
                  await cleanupManager.instantCleanup();
                } finally {
                  await cleanupContext.close();
                }
              } catch (error) {
                throw new Error(`Failed to create or use provider: ${String(error)}`);
              } finally {
                await context.close();
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
