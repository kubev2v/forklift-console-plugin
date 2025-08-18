import { existsSync } from 'fs';
import { join } from 'path';

import { test } from '@playwright/test';

const providersPath = join(__dirname, '../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../.providers.json';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';
import { ProviderDetailsPage } from '../page-objects/ProviderDetailsPage';
import { ProvidersListPage } from '../page-objects/ProvidersListPage';
import { createPlanTestData, type ProviderConfig, type ProviderData } from '../types/test-data';
import { ResourceManager } from '../utils/ResourceManager';

test.describe.serial(
  'Plans - Downstream End-to-End Migration',
  {
    tag: '@downstream',
  },
  () => {
    const resourceManager = new ResourceManager();

    let testProviderData: ProviderData = {
      name: '',
      type: 'vsphere',
      endpointType: 'vcenter',
      hostname: '',
      username: '',
      password: '',
      vddkInitImage: '',
    };

    test(
      'should create a new vsphere provider',
      {
        tag: '@downstream',
      },
      async ({ page }) => {
        const providersPage = new ProvidersListPage(page);
        await providersPage.navigateFromMainMenu();
        const createProvider = new CreateProviderPage(page, resourceManager);

        const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
        const providerName = `test-vsphere-provider-${Date.now()}`;
        const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

        testProviderData = {
          name: providerName,
          type: providerConfig.type,
          endpointType: 'esxi',
          hostname: providerConfig.api_url,
          username: providerConfig.username,
          password: providerConfig.password,
          vddkInitImage: providerConfig.vddk_init_image,
        };

        await providersPage.clickCreateProviderButton();
        await createProvider.waitForWizardLoad();
        await createProvider.fillAndSubmit(testProviderData);

        const providerDetailsPage = new ProviderDetailsPage(page);
        await providerDetailsPage.waitForPageLoad();
        await providerDetailsPage.verifyProviderDetails(testProviderData);
      },
    );

    test(
      'should run plan creation wizard',
      {
        tag: ['@downstream'],
      },
      async ({ page }) => {
        const planName = `${testProviderData.name}-plan`;

        const testPlanData = createPlanTestData({
          planName,
          planProject: 'openshift-mtv',
          sourceProvider: testProviderData.name,
          targetProvider: 'host',
          targetProject: 'default',
          networkMap: {
            name: `${planName}-network-map`,
            isPreExisting: false,
          },
          storageMap: {
            name: `${planName}-storage-map`,
            isPreExisting: false,
          },
        });

        const plansPage = new PlansListPage(page);
        await plansPage.navigateFromMainMenu();
        const createWizard = new CreatePlanWizardPage(page, resourceManager);
        const planDetailsPage = new PlanDetailsPage(page);
        await plansPage.clickCreatePlanButton();
        await createWizard.waitForWizardLoad();
        await createWizard.fillAndSubmit(testPlanData);
        await planDetailsPage.verifyBasicPlanDetailsPage(testPlanData);
      },
    );

    test.afterAll(() => {
      resourceManager.saveResourcesToFile();
    });
  },
);
