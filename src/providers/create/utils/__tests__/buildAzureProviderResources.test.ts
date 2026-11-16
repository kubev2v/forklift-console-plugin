import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildAzureProviderResources } from '../buildAzureProviderResources';

const baseFields = {
  [ProviderFormFieldId.AzureClientId]: 'client-id',
  [ProviderFormFieldId.AzureClientSecret]: 'client-secret',
  [ProviderFormFieldId.AzureSubscriptionId]: 'subscription-id',
  [ProviderFormFieldId.AzureTenantId]: 'tenant-id',
  [ProviderFormFieldId.ProviderName]: 'azure',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'azure' as const,
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildAzureProviderResources', () => {
  it('builds an azure provider without a url and encodes the required credentials', () => {
    const { provider, secret } = buildAzureProviderResources(baseFields);

    expect(provider.spec?.type).toBe('azure');
    expect(provider.spec?.url).toBeUndefined();
    expect(provider.spec?.settings).toBeUndefined();
    expect(decode(secret.data?.clientId ?? '')).toBe('client-id');
    expect(decode(secret.data?.clientSecret ?? '')).toBe('client-secret');
    expect(decode(secret.data?.subscriptionId ?? '')).toBe('subscription-id');
    expect(decode(secret.data?.tenantId ?? '')).toBe('tenant-id');
    expect(secret.data?.resourceGroup).toBeUndefined();
  });

  it('stores the resource group when provided', () => {
    const { secret } = buildAzureProviderResources({
      ...baseFields,
      [ProviderFormFieldId.AzureResourceGroup]: ' source-rg ',
    });

    expect(decode(secret.data?.resourceGroup ?? '')).toBe('source-rg');
  });

  it('stores the advanced settings when provided', () => {
    const { provider } = buildAzureProviderResources({
      ...baseFields,
      [ProviderFormFieldId.AzureSnapshotResourceGroup]: 'snapshot-rg',
      [ProviderFormFieldId.AzureSnapshotSku]: 'Standard_ZRS',
      [ProviderFormFieldId.AzureTargetRegion]: 'westus2',
      [ProviderFormFieldId.AzureVolumeSnapshotClassName]: 'azure-snapclass',
    });

    expect(provider.spec?.settings).toEqual({
      snapshotResourceGroup: 'snapshot-rg',
      snapshotSku: 'Standard_ZRS',
      targetRegion: 'westus2',
      volumeSnapshotClassName: 'azure-snapclass',
    });
  });

  it('omits blank advanced settings', () => {
    const { provider } = buildAzureProviderResources({
      ...baseFields,
      [ProviderFormFieldId.AzureSnapshotResourceGroup]: '   ',
      [ProviderFormFieldId.AzureTargetRegion]: '',
    });

    expect(provider.spec?.settings).toBeUndefined();
  });
});
