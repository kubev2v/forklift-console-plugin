import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getMapResourceLabel } from '../utils';

describe('getMapResourceLabel - providers', () => {
  it('returns empty for missing resource or unknown provider', () => {
    expect(getMapResourceLabel(undefined)).toBe('');
    expect(getMapResourceLabel({ name: 'x', providerType: 'unknown' } as never)).toBe('');
  });

  it('formats openshift with and without namespace', () => {
    expect(
      getMapResourceLabel({ name: 'net', namespace: 'ns', providerType: PROVIDER_TYPES.openshift } as never),
    ).toBe('ns/net');
    expect(
      getMapResourceLabel({ name: 'net', providerType: PROVIDER_TYPES.openshift } as never),
    ).toBe('net');
  });

  it('uses path for ovirt when present otherwise name', () => {
    expect(
      getMapResourceLabel({ name: 'n', path: '/p', providerType: PROVIDER_TYPES.ovirt } as never),
    ).toBe('/p');
    expect(getMapResourceLabel({ name: 'n', providerType: PROVIDER_TYPES.ovirt } as never)).toBe('n');
  });

  it('returns name for vsphere-like providers', () => {
    expect(getMapResourceLabel({ name: 'ds', providerType: PROVIDER_TYPES.vsphere } as never)).toBe(
      'ds',
    );
  });
});
