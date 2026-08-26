import { getVmPowerState } from '../getVmPowerState';

describe('getVmPowerState - providers', () => {
  it.each([
    ['ovirt', { status: 'up' }, 'on'],
    ['ovirt', { status: 'down' }, 'off'],
    ['ovirt', { status: 'paused' }, 'unknown'],
    ['vsphere', { powerState: 'poweredOn' }, 'on'],
    ['vsphere', { powerState: 'poweredOff' }, 'off'],
    ['vsphere', { powerState: 'suspended' }, 'unknown'],
    ['openstack', { status: 'ACTIVE' }, 'on'],
    ['openstack', { status: 'SHUTOFF' }, 'off'],
    ['openstack', { status: 'ERROR' }, 'unknown'],
    ['ova', {}, 'off'],
    ['hyperv', { powerState: 'On' }, 'on'],
    ['hyperv', { powerState: 'Off' }, 'off'],
    ['hyperv', { powerState: 'Saved' }, 'unknown'],
  ] as const)('%s maps %j to %s', (providerType, fields, expected) => {
    expect(getVmPowerState({ providerType, ...fields } as never)).toBe(expected);
  });

  it('maps openshift Running printableStatus to on, otherwise off', () => {
    expect(
      getVmPowerState({
        object: { status: { printableStatus: 'Running' } },
        providerType: 'openshift',
      } as never),
    ).toBe('on');
    expect(
      getVmPowerState({
        object: { status: { printableStatus: 'Stopped' } },
        providerType: 'openshift',
      } as never),
    ).toBe('off');
    expect(getVmPowerState({ providerType: 'openshift' } as never)).toBe('off');
  });

  it.each([
    ['running', 'on'],
    ['RUNNING', 'on'],
    ['stopped', 'off'],
    ['pending', 'unknown'],
  ] as const)('ec2 State.Name %s maps to %s', (name, expected) => {
    expect(
      getVmPowerState({
        object: { State: { Name: name } },
        providerType: 'ec2',
      } as never),
    ).toBe(expected);
  });
});
