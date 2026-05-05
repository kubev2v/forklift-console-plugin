import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { type Ec2VmLike, getEc2SubnetIds, isEc2Vm } from '../ec2Inventory';

const makeVm = (providerType: string, object?: Record<string, unknown>): ProviderVirtualMachine =>
  ({ object, providerType }) as unknown as ProviderVirtualMachine;

describe('isEc2Vm', () => {
  it('returns true for ec2 provider type', () => {
    expect(isEc2Vm(makeVm(PROVIDER_TYPES.ec2))).toBe(true);
  });

  it('returns false for vsphere provider type', () => {
    expect(isEc2Vm(makeVm(PROVIDER_TYPES.vsphere))).toBe(false);
  });

  it('returns false for openshift provider type', () => {
    expect(isEc2Vm(makeVm(PROVIDER_TYPES.openshift))).toBe(false);
  });
});

describe('getEc2SubnetIds', () => {
  const makeEc2Vm = (object?: Record<string, unknown>): Ec2VmLike =>
    ({ object, providerType: PROVIDER_TYPES.ec2 }) as unknown as Ec2VmLike;

  it('extracts subnet IDs from NetworkInterfaces', () => {
    const vm = makeEc2Vm({
      NetworkInterfaces: [{ SubnetId: 'subnet-aaa' }, { SubnetId: 'subnet-bbb' }],
      SubnetId: 'subnet-ccc',
    });
    expect(getEc2SubnetIds(vm)).toEqual(['subnet-aaa', 'subnet-bbb']);
  });

  it('falls back to top-level SubnetId when no NetworkInterfaces', () => {
    const vm = makeEc2Vm({ SubnetId: 'subnet-abc' });
    expect(getEc2SubnetIds(vm)).toEqual(['subnet-abc']);
  });

  it('falls back to top-level SubnetId when interfaces exist but have no SubnetId', () => {
    const vm = makeEc2Vm({
      NetworkInterfaces: [{ SubnetId: undefined }, {}],
      SubnetId: 'subnet-fallback',
    });
    expect(getEc2SubnetIds(vm)).toEqual(['subnet-fallback']);
  });

  it('returns empty array when no subnet info available', () => {
    const vm = makeEc2Vm({});
    expect(getEc2SubnetIds(vm)).toEqual([]);
  });

  it('returns empty array when object is undefined', () => {
    const vm = makeEc2Vm(undefined);
    expect(getEc2SubnetIds(vm)).toEqual([]);
  });

  it('skips interfaces with missing SubnetId', () => {
    const vm = makeEc2Vm({
      NetworkInterfaces: [{ SubnetId: 'subnet-111' }, {}, { SubnetId: 'subnet-333' }],
    });
    expect(getEc2SubnetIds(vm)).toEqual(['subnet-111', 'subnet-333']);
  });

  it('falls back when NetworkInterfaces is empty array', () => {
    const vm = makeEc2Vm({
      NetworkInterfaces: [],
      SubnetId: 'subnet-top',
    });
    expect(getEc2SubnetIds(vm)).toEqual(['subnet-top']);
  });
});
