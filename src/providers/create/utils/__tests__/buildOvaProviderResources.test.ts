import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildOvaProviderResources } from '../buildOvaProviderResources';

const baseFields = {
  [ProviderFormFieldId.NfsDirectory]: 'host:/ova',
  [ProviderFormFieldId.ProviderName]: 'ova',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ova' as const,
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildOvaProviderResources', () => {
  it('builds ova provider url from nfs directory', () => {
    const { provider, secret } = buildOvaProviderResources(baseFields);

    expect(provider.spec?.type).toBe('ova');
    expect(provider.spec?.url).toBe('host:/ova');
    expect(secret.metadata?.namespace).toBe('ns');
  });

  it('sets applianceManagement to true when enabled', () => {
    const { provider } = buildOvaProviderResources({
      ...baseFields,
      [ProviderFormFieldId.OvaApplianceManagement]: true,
    });

    expect(provider.spec?.settings?.applianceManagement).toBe('true');
  });

  it('omits applianceManagement when the flag is false', () => {
    const { provider } = buildOvaProviderResources({
      ...baseFields,
      [ProviderFormFieldId.OvaApplianceManagement]: false,
    });

    expect(provider.spec?.settings?.applianceManagement).toBeUndefined();
  });
});
