import { describe, expect, it } from '@jest/globals';

import { buildSecretObject } from '../buildSecretObject';

describe('buildSecretObject - build', () => {
  it('builds opaque secrets with optional data', () => {
    expect(buildSecretObject({ namespace: 'ns' })).toEqual({
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { namespace: 'ns' },
      type: 'Opaque',
    });
    expect(buildSecretObject({ data: { user: 'x' }, namespace: 'ns' }).data).toEqual({ user: 'x' });
  });
});
