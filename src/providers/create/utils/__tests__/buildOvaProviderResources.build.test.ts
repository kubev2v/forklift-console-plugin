import { describe, expect, it } from '@jest/globals';
import { TRUE_VALUE } from 'src/providers/utils/constants';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildOvaProviderResources } from '../buildOvaProviderResources';

describe('buildOvaProviderResources - build', () => {
  it('builds ova provider url from nfs directory', () => {
    const { provider, secret } = buildOvaProviderResources({
      [ProviderFormFieldId.NfsDirectory]: 'host:/ova',
      [ProviderFormFieldId.ProviderName]: 'ova',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'ova',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    } as never);

    expect(provider.spec?.type).toBe('ova');
    expect(provider.spec?.url).toBe('host:/ova');
    expect(secret.metadata?.namespace).toBe('ns');
  });

  it('sets applianceManagement when enabled', () => {
    const { provider } = buildOvaProviderResources({
      [ProviderFormFieldId.NfsDirectory]: 'host:/ova',
      [ProviderFormFieldId.OvaApplianceManagement]: true,
      [ProviderFormFieldId.ProviderName]: 'ova',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'ova',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    } as never);

    expect(provider.spec?.settings?.applianceManagement).toBe(TRUE_VALUE);
  });
});
