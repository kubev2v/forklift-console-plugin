import { getVmPowerState } from '../getVmPowerState';

describe('getVmPowerState - edgeCases', () => {
  it('returns unknown for undefined vm', () => {
    expect(getVmPowerState(undefined)).toBe('unknown');
  });

  it('returns unknown for unrecognized provider types', () => {
    expect(getVmPowerState({ providerType: 'unknown' } as never)).toBe('unknown');
    expect(getVmPowerState({ providerType: undefined } as never)).toBe('unknown');
  });

  it('returns unknown when provider-specific power fields are missing', () => {
    expect(getVmPowerState({ providerType: 'ovirt' } as never)).toBe('unknown');
    expect(getVmPowerState({ providerType: 'vsphere' } as never)).toBe('unknown');
    expect(getVmPowerState({ providerType: 'openstack' } as never)).toBe('unknown');
    expect(getVmPowerState({ providerType: 'hyperv' } as never)).toBe('unknown');
    expect(getVmPowerState({ providerType: 'ec2' } as never)).toBe('unknown');
    expect(getVmPowerState({ object: {}, providerType: 'ec2' } as never)).toBe('unknown');
  });

  it('normalizes hyperv powerState case-insensitively', () => {
    expect(getVmPowerState({ powerState: 'ON', providerType: 'hyperv' } as never)).toBe('on');
    expect(getVmPowerState({ powerState: 'off', providerType: 'hyperv' } as never)).toBe('off');
  });
});
