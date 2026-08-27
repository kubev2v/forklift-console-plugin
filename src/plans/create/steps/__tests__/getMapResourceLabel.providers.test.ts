import type { InventoryStorage } from 'src/utils/hooks/useStorages';
import type { Ec2Network } from 'src/utils/types/ec2Inventory';

import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import type { ProviderNetwork } from '../../types';
import { getMapResourceLabel } from '../utils';

const nameOnlyNetwork = (
  providerType: Ec2Network['providerType'] | 'hyperv' | 'ova' | 'openstack' | 'vsphere',
  name: string,
): ProviderNetwork =>
  ({
    id: 'res-1',
    name,
    providerType,
    revision: 1,
    selfLink: `/providers/${providerType}/uid/networks/res-1`,
  }) as ProviderNetwork;

describe('getMapResourceLabel', () => {
  it('returns empty for missing resource or unknown provider', () => {
    expect(getMapResourceLabel(undefined)).toBe('');
    expect(
      getMapResourceLabel({
        id: 'x',
        name: 'x',
        providerType: 'unknown',
        revision: 1,
        selfLink: '',
      } as ProviderNetwork),
    ).toBe('');
  });

  it('formats openshift with and without namespace', () => {
    const withNamespace = {
      id: 'net-1',
      name: 'net',
      namespace: 'ns',
      providerType: PROVIDER_TYPES.openshift,
      revision: 1,
      selfLink: '',
    } as ProviderNetwork;
    const withoutNamespace = {
      id: 'net-1',
      name: 'net',
      providerType: PROVIDER_TYPES.openshift,
      revision: 1,
      selfLink: '',
    } as ProviderNetwork;

    expect(getMapResourceLabel(withNamespace)).toBe('ns/net');
    expect(getMapResourceLabel(withoutNamespace)).toBe('net');
  });

  it('uses path for ovirt when present otherwise name', () => {
    const withPath = {
      id: 'n-1',
      name: 'n',
      path: '/p',
      providerType: PROVIDER_TYPES.ovirt,
      revision: 1,
      selfLink: '',
    } as ProviderNetwork;
    const withoutPath = {
      id: 'n-1',
      name: 'n',
      providerType: PROVIDER_TYPES.ovirt,
      revision: 1,
      selfLink: '',
    } as ProviderNetwork;

    expect(getMapResourceLabel(withPath)).toBe('/p');
    expect(getMapResourceLabel(withoutPath)).toBe('n');
  });

  it.each([
    PROVIDER_TYPES.ec2,
    PROVIDER_TYPES.hyperv,
    PROVIDER_TYPES.ova,
    PROVIDER_TYPES.openstack,
    PROVIDER_TYPES.vsphere,
  ] as const)('returns name for %s resources', (providerType) => {
    expect(getMapResourceLabel(nameOnlyNetwork(providerType, 'ds'))).toBe('ds');
  });

  it.each([
    PROVIDER_TYPES.ec2,
    PROVIDER_TYPES.hyperv,
    PROVIDER_TYPES.ova,
    PROVIDER_TYPES.openstack,
    PROVIDER_TYPES.vsphere,
  ] as const)('returns empty string for %s resources with no name', (providerType) => {
    expect(getMapResourceLabel(nameOnlyNetwork(providerType, ''))).toBe('');
  });

  it('returns name for EC2 storage (volume type)', () => {
    const storage: InventoryStorage = {
      id: 'gp3',
      name: 'gp3',
      providerType: 'ec2',
      revision: 1,
      selfLink: '/providers/ec2/uid/storages/gp3',
    };
    expect(getMapResourceLabel(storage)).toBe('gp3');
  });
});
