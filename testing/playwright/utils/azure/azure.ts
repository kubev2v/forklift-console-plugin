import { hasProviderConfig } from '../providers';
import type { SkippableTest } from '../version/types';

export const AZURE_PROVIDER_KEY = process.env.AZURE_PROVIDER ?? 'azure';

const SKIP_MESSAGE = 'Skipped: no Azure provider in .providers.json (non-Azure cluster)';

/**
 * Skips the test unless .providers.json contains an Azure provider entry, which
 * also indicates the cluster under test is running on Azure.
 */
export const requireAzureProviderConfig = (testObj: SkippableTest): void => {
  testObj.skip(!hasProviderConfig(AZURE_PROVIDER_KEY), SKIP_MESSAGE);
};
