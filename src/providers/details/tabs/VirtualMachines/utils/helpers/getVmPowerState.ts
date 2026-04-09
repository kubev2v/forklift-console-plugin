import type {
  HypervVM,
  OpenshiftVM,
  OpenstackVM,
  OVirtVM,
  ProviderVirtualMachine,
  VSphereVM,
} from '@forklift-ui/types';
import type { ExtendedProviderType } from '@utils/enums';

import type { Ec2VM } from '../types/Ec2VM';

export type PowerState = 'on' | 'off' | 'unknown';

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

const getHypervVmPowerState = (vm: HypervVM): PowerState => {
  // Backend returns powerState as 'On' or 'Off' (capitalized)
  const powerState = (vm as HypervVM & { powerState?: string })?.powerState?.toLowerCase();
  if (powerState === 'on') return 'on';
  if (powerState === 'off') return 'off';
  return 'unknown';
};

const getEc2VmPowerState = (vm: Ec2VM): PowerState => {
  const state = vm?.object?.State?.Name?.toLowerCase();

  switch (state) {
    case 'running':
      return 'on';
    case 'stopped':
      return 'off';
    case undefined:
    default:
      return 'unknown';
  }
};

export const getVmPowerState = (vm: ProviderVirtualMachine | Ec2VM | undefined): PowerState => {
  if (!vm) return 'unknown';

  switch (vm?.providerType as ExtendedProviderType) {
    case 'ovirt':
      return getOVirtVmPowerState(vm as OVirtVM);
    case 'vsphere':
      return getVSphereVmPowerState(vm as VSphereVM);
    case 'openstack':
      return getOpenStackVmPowerState(vm as OpenstackVM);
    case 'openshift':
      return getOpenShiftVmPowerState(vm as OpenshiftVM);
    case 'hyperv':
      return getHypervVmPowerState(vm as HypervVM);
    case 'ec2':
      return getEc2VmPowerState(vm as Ec2VM);
    case 'ova':
      return 'off';
    default:
      return 'unknown';
  }
};
