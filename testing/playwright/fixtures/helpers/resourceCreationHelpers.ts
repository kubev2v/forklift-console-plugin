import type { IoK8sApiCoreV1Secret, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { EndpointType, ProviderType } from '../../types/enums';
import { createPlanTestData, type ProviderData } from '../../types/test-data';
import { getProviderConfig } from '../../utils/providers';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

export type TestProvider = V1beta1Provider & {
  metadata: {
    name: string;
    namespace: string;
  };
};

export type TestPlan = V1beta1Plan & {
  metadata: {
    name: string;
    namespace: string;
  };
  testData: ReturnType<typeof createPlanTestData>;
};

export const createProvider = async (
  page: Page,
  resourceManager: ResourceManager,
  namePrefix = 'test-provider',
  providerKey?: string,
): Promise<TestProvider> => {
  const uniqueId = crypto.randomUUID();
  const providerName = `${namePrefix}-${uniqueId}`;

  const key = providerKey ?? process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  const providerConfig = getProviderConfig(key);

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${providerKey}`);
  }

  const testProviderData: ProviderData = {
    name: providerName,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? EndpointType.VCENTER,
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
  };

  // For OVA providers, create directly via API with applianceManagement setting
  if (providerConfig.type === ProviderType.OVA) {
    // Navigate to console to establish session (needed for CSRF token)
    const createProviderPage = new CreateProviderPage(page, resourceManager);
    await createProviderPage.navigationHelper.navigateToConsole();

    // Create minimal secret (CRD requires spec.secret, OVA only needs URL, no credentials)
    const secretName = `${providerName}-secret`;
    const secret: IoK8sApiCoreV1Secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: secretName,
        namespace: MTV_NAMESPACE,
      },
      type: 'Opaque',
      stringData: {
        url: testProviderData.hostname,
      },
    };

    const createdSecret = await resourceManager.createSecret(page, secret);
    if (!createdSecret) {
      throw new Error(`Failed to create secret for OVA provider ${providerName}`);
    }

    // Create provider with applianceManagement setting
    const provider: V1beta1Provider = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Provider',
      metadata: {
        name: providerName,
        namespace: MTV_NAMESPACE,
      },
      spec: {
        type: ProviderType.OVA,
        url: testProviderData.hostname,
        secret: {
          name: secretName,
          namespace: MTV_NAMESPACE,
        },
        settings: {
          applianceManagement: 'true',
        },
      },
    };

    const createdProvider = await resourceManager.createProvider(page, provider);
    if (!createdProvider) {
      throw new Error(`Failed to create OVA provider ${providerName}`);
    }

    // Register provider for cleanup
    resourceManager.addProvider(providerName, MTV_NAMESPACE);
  } else {
    // For non-OVA providers, use the UI
    const createProviderPage = new CreateProviderPage(page, resourceManager);

    await createProviderPage.navigate();
    await createProviderPage.create(testProviderData);
  }

  const provider: TestProvider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: providerName,
      namespace: MTV_NAMESPACE,
    },
  };

  (provider as any).testData = testProviderData;
  return provider;
};

export const createProviderWithCustomData = async (
  page: Page,
  resourceManager: ResourceManager,
  options: {
    providerKey?: string;
    namePrefix?: string;
    customProviderData?: Partial<ProviderData>;
  } = {},
): Promise<TestProvider> => {
  const { providerKey, namePrefix = 'test-provider', customProviderData } = options;

  const uniqueId = crypto.randomUUID();
  const providerName = customProviderData?.name ?? `${namePrefix}-${uniqueId}`;

  const key = providerKey ?? process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  const providerConfig = getProviderConfig(key);

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${key}`);
  }

  // Build default provider data from config
  const defaultProviderData: ProviderData = {
    name: providerName,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? EndpointType.VCENTER,
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
  };

  // Merge with custom overrides
  const testProviderData = customProviderData
    ? { ...defaultProviderData, ...customProviderData }
    : defaultProviderData;

  // If skipVddk is true, remove vddkInitImage
  if (testProviderData.skipVddk) {
    testProviderData.vddkInitImage = undefined;
  }

  // For OVA providers, create directly via API with applianceManagement setting
  if (testProviderData.type === ProviderType.OVA) {
    // Navigate to console to establish session (needed for CSRF token)
    const createProviderPage = new CreateProviderPage(page, resourceManager);
    await createProviderPage.navigationHelper.navigateToConsole();

    // Create minimal secret (CRD requires spec.secret, OVA only needs URL, no credentials)
    const secretName = `${testProviderData.name}-secret`;
    const secret: IoK8sApiCoreV1Secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: secretName,
        namespace: MTV_NAMESPACE,
      },
      type: 'Opaque',
      stringData: {
        url: testProviderData.hostname,
      },
    };

    const createdSecret = await resourceManager.createSecret(page, secret);
    if (!createdSecret) {
      throw new Error(`Failed to create secret for OVA provider ${testProviderData.name}`);
    }

    // Create provider with applianceManagement setting
    const provider: V1beta1Provider = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Provider',
      metadata: {
        name: testProviderData.name,
        namespace: MTV_NAMESPACE,
      },
      spec: {
        type: ProviderType.OVA,
        url: testProviderData.hostname,
        secret: {
          name: secretName,
          namespace: MTV_NAMESPACE,
        },
        settings: {
          applianceManagement: 'true',
        },
      },
    };

    const createdProvider = await resourceManager.createProvider(page, provider);
    if (!createdProvider) {
      throw new Error(`Failed to create OVA provider ${testProviderData.name}`);
    }

    // Register provider for cleanup
    resourceManager.addProvider(testProviderData.name, MTV_NAMESPACE);
  } else {
    // For non-OVA providers, use the UI
    const createProviderPage = new CreateProviderPage(page, resourceManager);

    await createProviderPage.navigate();
    await createProviderPage.create(testProviderData);
  }

  const provider: TestProvider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: testProviderData.name,
      namespace: MTV_NAMESPACE,
    },
  };

  (provider as any).testData = testProviderData;
  return provider;
};

export const createPlanWithCustomData = async (
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
      namespace: MTV_NAMESPACE,
    },
    testData: testPlanData,
  };

  return plan;
};

export const createPlan = async (
  page: Page,
  resourceManager: ResourceManager,
  sourceProvider: V1beta1Provider,
): Promise<TestPlan> => {
  return createPlanWithCustomData(page, resourceManager, { sourceProvider });
};
