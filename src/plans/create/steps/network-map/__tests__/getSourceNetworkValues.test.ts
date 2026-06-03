import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import type { ProviderNetwork } from '../../../types';
import { getSourceNetworkValues } from '../utils';

const makeEc2Network = (id: string, name: string): ProviderNetwork =>
  ({
    id,
    name,
    providerType: PROVIDER_TYPES.ec2,
    revision: 1,
    selfLink: `/providers/ec2/uid/networks/${id}`,
  }) as ProviderNetwork;

const makeEc2Vm = (
  subnetId: string | undefined,
  networkInterfaces?: { SubnetId?: string }[],
): ProviderVirtualMachine =>
  ({
    id: 'i-test',
    name: 'test-instance',
    object: {
      NetworkInterfaces: networkInterfaces,
      SubnetId: subnetId,
    },
    providerType: PROVIDER_TYPES.ec2,
  }) as unknown as ProviderVirtualMachine;

describe('getSourceNetworkValues - EC2', () => {
  const subnets: ProviderNetwork[] = [
    makeEc2Network('subnet-aaa', 'subnet-a'),
    makeEc2Network('subnet-bbb', 'subnet-b'),
  ];

  it('categorizes matching EC2 subnets as used', () => {
    const vm = makeEc2Vm('subnet-aaa', [{ SubnetId: 'subnet-aaa' }]);
    const { other, used } = getSourceNetworkValues(subnets, [vm], []);

    expect(used).toHaveLength(1);
    expect(used[0].id).toBe('subnet-aaa');
    expect(other).toHaveLength(1);
    expect(other[0].id).toBe('subnet-bbb');
  });

  it('returns all subnets as other when EC2 VM has no subnet data', () => {
    const vm = makeEc2Vm(undefined, undefined);
    const { other, used } = getSourceNetworkValues(subnets, [vm], []);

    expect(used).toHaveLength(0);
    expect(other).toHaveLength(2);
  });

  it('returns empty used and other when no source networks exist', () => {
    const vm = makeEc2Vm('subnet-aaa');
    const { other, used } = getSourceNetworkValues([], [vm], []);

    expect(used).toHaveLength(0);
    expect(other).toHaveLength(0);
  });

  it('matches via SubnetId fallback when NetworkInterfaces is empty', () => {
    const vm = makeEc2Vm('subnet-bbb', []);
    const { used } = getSourceNetworkValues(subnets, [vm], []);

    expect(used).toHaveLength(1);
    expect(used[0].id).toBe('subnet-bbb');
  });

  it('categorizes VPC entries as other (VMs reference subnets, not VPCs)', () => {
    const networks: ProviderNetwork[] = [
      makeEc2Network('vpc-111', 'my-vpc'),
      makeEc2Network('subnet-aaa', 'subnet-a'),
    ];
    const vm = makeEc2Vm('subnet-aaa', [{ SubnetId: 'subnet-aaa' }]);
    const { other, used } = getSourceNetworkValues(networks, [vm], []);

    expect(used).toHaveLength(1);
    expect(used[0].id).toBe('subnet-aaa');
    expect(other).toHaveLength(1);
    expect(other[0].id).toBe('vpc-111');
  });
});
