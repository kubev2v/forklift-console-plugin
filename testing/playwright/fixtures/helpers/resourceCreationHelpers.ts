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

/**
 * Creates a Kubernetes Secret object with standard defaults
 */
export const createSecretObject = (
  name: string,
  namespace: string,
  stringData: Record<string, string>,
): IoK8sApiCoreV1Secret => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: { name, namespace },
  type: 'Opaque',
  stringData,
});

/**
 * Creates a Provider CRD object
 */
const createProviderObject = (
  name: string,
  namespace: string,
  spec: V1beta1Provider['spec'],
): V1beta1Provider => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name, namespace },
  spec,
});

/**
 * Builds the TestProvider result with attached test data
 */
const buildTestProviderResult = (providerData: ProviderData): TestProvider => {
  const provider: TestProvider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: providerData.name,
      namespace: MTV_NAMESPACE,
    },
  };
  (provider as any).testData = providerData;
  return provider;
};

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

export interface CreateProviderOptions {
  providerKey?: string;
  namePrefix?: string;
  customProviderData?: Partial<ProviderData>;
}

/**
 * Creates an OVA provider via API (UI doesn't support all OVA settings)
 */
const createOvaProviderViaApi = async (
  page: Page,
  resourceManager: ResourceManager,
  providerData: ProviderData,
): Promise<void> => {
  const createProviderPage = new CreateProviderPage(page, resourceManager);
  await createProviderPage.navigationHelper.navigateToConsole();

  const secretName = `${providerData.name}-secret`;
  const secret = createSecretObject(secretName, MTV_NAMESPACE, { url: providerData.hostname });

  const createdSecret = await resourceManager.createSecret(page, secret);
  if (!createdSecret) {
    throw new Error(`Failed to create secret for OVA provider ${providerData.name}`);
  }

  const provider = createProviderObject(providerData.name, MTV_NAMESPACE, {
    type: ProviderType.OVA,
    url: providerData.hostname,
    secret: { name: secretName, namespace: MTV_NAMESPACE },
    settings: { applianceManagement: 'true' },
  });

  const createdProvider = await resourceManager.createProvider(page, provider);
  if (!createdProvider) {
    throw new Error(`Failed to create OVA provider ${providerData.name}`);
  }

  resourceManager.addProvider(providerData.name, MTV_NAMESPACE);
};

/**
 * Creates a non-OVA provider via UI
 */
const createProviderViaUi = async (
  page: Page,
  resourceManager: ResourceManager,
  providerData: ProviderData,
): Promise<void> => {
  const createProviderPage = new CreateProviderPage(page, resourceManager);
  await createProviderPage.navigate();
  await createProviderPage.create(providerData);
};

/**
 * Builds provider data from config and optional customizations
 */
const buildProviderData = (
  providerKey: string,
  providerName: string,
  customProviderData?: Partial<ProviderData>,
): ProviderData => {
  const providerConfig = getProviderConfig(providerKey);

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${providerKey}`);
  }

  const baseData: ProviderData = {
    name: providerName,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    endpointType: providerConfig.endpoint_type ?? EndpointType.VCENTER,
    hostname: providerConfig.api_url,
    username: providerConfig.username,
    password: providerConfig.password,
    vddkInitImage: providerConfig.vddk_init_image,
  };

  const mergedData = customProviderData ? { ...baseData, ...customProviderData } : baseData;

  // If skipVddk is true, remove vddkInitImage
  if (mergedData.skipVddk) {
    mergedData.vddkInitImage = undefined;
  }

  return mergedData;
};

/**
 * Generates a unique provider name from prefix
 */
const generateProviderName = (namePrefix: string, customName?: string): string =>
  customName ?? `${namePrefix}-${crypto.randomUUID()}`;

/**
 * Resolves the provider key from options or environment
 */
const resolveProviderKey = (providerKey?: string): string =>
  providerKey ?? process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';

/**
 * Creates a test provider with optional customization.
 *
 * @example
 * // Simple usage - uses default provider from env
 * const provider = await createProvider(page, resourceManager);
 *
 * @example
 * // With specific provider key
 * const provider = await createProvider(page, resourceManager, { providerKey: 'vsphere-8.0.1' });
 *
 * @example
 * // With custom data (e.g., skip VDDK)
 * const provider = await createProvider(page, resourceManager, {
 *   providerKey: 'vsphere-8.0.1',
 *   customProviderData: { skipVddk: true },
 * });
 */
export const createProvider = async (
  page: Page,
  resourceManager: ResourceManager,
  options: CreateProviderOptions = {},
): Promise<TestProvider> => {
  const { providerKey, namePrefix = 'test-provider', customProviderData } = options;

  const providerName = generateProviderName(namePrefix, customProviderData?.name);
  const key = resolveProviderKey(providerKey);
  const providerData = buildProviderData(key, providerName, customProviderData);

  if (providerData.type === ProviderType.OVA) {
    await createOvaProviderViaApi(page, resourceManager, providerData);
  } else {
    await createProviderViaUi(page, resourceManager, providerData);
  }

  return buildTestProviderResult(providerData);
};

export interface CreatePlanOptions {
  sourceProvider: V1beta1Provider;
  customPlanData?: Partial<ReturnType<typeof createPlanTestData>>;
}

/**
 * Builds plan test data with optional customizations
 */
const buildPlanTestData = (
  sourceProviderName: string,
  customPlanData?: Partial<ReturnType<typeof createPlanTestData>>,
): ReturnType<typeof createPlanTestData> => {
  const defaultPlanData = createPlanTestData({ sourceProvider: sourceProviderName });
  return customPlanData ? { ...defaultPlanData, ...customPlanData } : defaultPlanData;
};

/**
 * Builds the TestPlan result object
 */
const buildTestPlanResult = (testPlanData: ReturnType<typeof createPlanTestData>): TestPlan => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: {
    name: testPlanData.planName,
    namespace: MTV_NAMESPACE,
  },
  testData: testPlanData,
});

/**
 * Creates a test plan with optional customization.
 *
 * @example
 * // Simple usage
 * const plan = await createPlan(page, resourceManager, { sourceProvider: myProvider });
 *
 * @example
 * // With custom plan data
 * const plan = await createPlan(page, resourceManager, {
 *   sourceProvider: myProvider,
 *   customPlanData: { planName: 'my-custom-plan' },
 * });
 */
export const createPlan = async (
  page: Page,
  resourceManager: ResourceManager,
  options: CreatePlanOptions,
): Promise<TestPlan> => {
  const { sourceProvider, customPlanData } = options;

  const testPlanData = buildPlanTestData(sourceProvider.metadata!.name!, customPlanData);

  const createWizard = new CreatePlanWizardPage(page, resourceManager);
  const planDetailsPage = new PlanDetailsPage(page);

  await createWizard.navigate();
  await createWizard.waitForWizardLoad();
  await createWizard.fillAndSubmit(testPlanData);
  await planDetailsPage.verifyPlanTitle(testPlanData.planName);

  return buildTestPlanResult(testPlanData);
};
