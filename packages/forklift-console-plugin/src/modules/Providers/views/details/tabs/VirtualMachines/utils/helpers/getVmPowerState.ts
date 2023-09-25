import {
  OpenshiftVM,
  OpenstackVM,
  OVirtVM,
  ProviderVirtualMachine,
  VSphereVM,
} from '@kubev2v/types';

export type PowerState = 'on' | 'off' | 'unknown';

export const getVmPowerState = (vm?: ProviderVirtualMachine): PowerState => {
  if (!vm) return 'unknown';

  switch (vm?.providerType) {
    case 'ovirt':
      return getOVirtVmPowerState(vm as OVirtVM);
    case 'vsphere':
      return getVSphereVmPowerState(vm as VSphereVM);
    case 'openstack':
      return getOpenStackVmPowerState(vm as OpenstackVM);
    case 'openshift':
      return getOpenShiftVmPowerState(vm as OpenshiftVM);
    case 'ova':
      return 'off';
    default:
      return 'unknown';
  }
};

const getOVirtVmPowerState = (vm: OVirtVM): PowerState => {
  switch (vm?.status) {
    case 'up':
      return 'on';
    case 'down':
      return 'off';
    default:
      return 'unknown';
  }
};

const getVSphereVmPowerState = (vm: VSphereVM): PowerState => {
  switch (vm?.powerState) {
    case 'poweredOn':
      return 'on';
    case 'poweredOff':
      return 'off';
    default:
      return 'unknown';
  }
};

const getOpenStackVmPowerState = (vm: OpenstackVM): PowerState => {
  switch (vm?.status) {
    case 'ACTIVE':
      return 'on';
    case 'SHUTOFF':
      return 'off';
    default:
      return 'unknown';
  }
};

const getOpenShiftVmPowerState = (vm: OpenshiftVM): PowerState =>
  vm?.object?.status?.printableStatus === 'Running' ? 'on' : 'off';
