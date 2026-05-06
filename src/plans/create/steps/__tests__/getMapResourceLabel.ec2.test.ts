import type { InventoryStorage } from 'src/utils/hooks/useStorages';

import { describe, expect, it } from '@jest/globals';

import type { ProviderNetwork } from '../../types';
import { getMapResourceLabel } from '../utils';

describe('getMapResourceLabel - EC2', () => {
  it('returns name for EC2 network', () => {
    const network: ProviderNetwork = {
      id: 'subnet-abc123',
      name: 'my-subnet',
      providerType: 'ec2',
      revision: 1,
      selfLink: '/providers/ec2/uid/networks/subnet-abc123',
    };
    expect(getMapResourceLabel(network)).toBe('my-subnet');
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

  it('returns empty string for EC2 resource with no name', () => {
    const network: ProviderNetwork = {
      id: 'subnet-abc123',
      name: '',
      providerType: 'ec2',
      revision: 1,
      selfLink: '',
    };
    expect(getMapResourceLabel(network)).toBe('');
  });

  it('returns empty string for undefined resource', () => {
    expect(getMapResourceLabel(undefined)).toBe('');
  });
});
