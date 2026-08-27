import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildProviderResources } from '../buildProviderResources';

describe('buildProviderResources - dispatch', () => {
  it('dispatches ova form data', () => {
    const { provider } = buildProviderResources({
      [ProviderFormFieldId.NfsDirectory]: 'host:/ova',
      [ProviderFormFieldId.ProviderName]: 'ova',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'ova',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    });

    expect(provider.spec?.type).toBe('ova');
  });

  it('throws for unsupported provider types', () => {
    expect(() =>
      buildProviderResources({
        [ProviderFormFieldId.ProviderType]: 'unknown',
      } as never),
    ).toThrow(/Unsupported provider type/);
  });
});
