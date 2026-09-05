import { describe, expect, it } from '@jest/globals';

import { buildProviderObject } from '../buildProviderObject';

describe('buildProviderObject - build', () => {
  it('builds a provider with optional settings', () => {
    const provider = buildProviderObject({
      name: 'p',
      namespace: 'ns',
      settings: { sdkEndpoint: 'vcenter' },
      type: 'vsphere',
      url: 'https://vcenter',
    });

    expect(provider).toEqual(
      expect.objectContaining({
        kind: 'Provider',
        metadata: { name: 'p', namespace: 'ns' },
        spec: expect.objectContaining({
          secret: { name: undefined, namespace: 'ns' },
          settings: { sdkEndpoint: 'vcenter' },
          type: 'vsphere',
          url: 'https://vcenter',
        }),
      }),
    );
  });

  it('omits empty settings', () => {
    const provider = buildProviderObject({
      name: 'p',
      namespace: 'ns',
      settings: {},
      type: 'ova',
    });
    expect(provider.spec?.settings).toBeUndefined();
  });
});
