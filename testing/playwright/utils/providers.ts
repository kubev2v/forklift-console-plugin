import { existsSync } from 'node:fs';
import { join } from 'node:path';

import * as providers from '../../.providers.json';
import type { ProviderConfig } from '../types/test-data';

const providersPath = join(__dirname, '../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

/**
 * Check if a provider configuration exists in .providers.json
 */
export const hasProviderConfig = (providerKey: string): boolean => {
  return providerKey in (providers as Record<string, ProviderConfig>);
};

/**
 * Get provider configuration from .providers.json
 */
export const getProviderConfig = (providerKey: string): ProviderConfig => {
  const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

  if (!providerConfig) {
    throw new Error(`Provider configuration not found for key: ${providerKey}`);
  }

  return providerConfig;
};
