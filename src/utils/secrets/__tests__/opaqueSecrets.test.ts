import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { filterOpaqueSecrets, isOpaqueSecret, OPAQUE_SECRET_TYPE } from '../opaqueSecrets';

describe('opaqueSecrets', () => {
  it('treats missing type as Opaque', () => {
    expect(isOpaqueSecret({})).toBe(true);
    expect(isOpaqueSecret({ type: undefined })).toBe(true);
    expect(isOpaqueSecret({ type: OPAQUE_SECRET_TYPE })).toBe(true);
    expect(isOpaqueSecret({ type: 'kubernetes.io/tls' })).toBe(false);
  });

  it('filters Opaque secrets including unset type', () => {
    const secrets = [
      { metadata: { name: 'a' }, type: OPAQUE_SECRET_TYPE },
      { metadata: { name: 'b' } },
      { metadata: { name: 'c' }, type: 'kubernetes.io/tls' },
    ] as IoK8sApiCoreV1Secret[];

    expect(filterOpaqueSecrets(secrets).map((secret) => secret.metadata?.name)).toEqual(['a', 'b']);
    expect(filterOpaqueSecrets(undefined)).toEqual([]);
    expect(filterOpaqueSecrets([])).toEqual([]);
  });
});
