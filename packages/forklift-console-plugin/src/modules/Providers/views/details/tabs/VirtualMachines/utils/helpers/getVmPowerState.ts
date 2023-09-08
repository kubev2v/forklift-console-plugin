import {
  OpenshiftVM,
  OpenstackVM,
  OVirtVM,
  ProviderVirtualMachine,
  VSphereVM,
} from '@kubev2v/types';

export type PowerState = 'on' | 'off' | 'unknown';

// moved from packages/legacy/src/common/components/VMNameWithPowerState.tsx
export const getVmPowerState = (vm?: ProviderVirtualMachine): PowerState => {
  let powerStatus: PowerState = 'unknown';
  if (!vm) return powerStatus;
  switch (vm?.providerType) {
    case 'ovirt': {
      if ((vm as OVirtVM).status === 'up') powerStatus = 'on';
      if ((vm as OVirtVM).status === 'down') powerStatus = 'off';
      break;
    }
    case 'vsphere': {
      if ((vm as VSphereVM).powerState === 'poweredOn') powerStatus = 'on';
      if ((vm as VSphereVM).powerState === 'poweredOff') powerStatus = 'off';
      break;
    }
    case 'openstack': {
      const status = (vm as OpenstackVM).status;
      if (status === 'ACTIVE') {
        powerStatus = 'on';
      }
      if (status === 'SHUTOFF') {
        powerStatus = 'off';
      }
      break;
    }
    case 'openshift': {
      const status = (vm as OpenshiftVM)?.object?.status?.printableStatus;
      if (status === 'Running') {
        powerStatus = 'on';
      } else {
        powerStatus = 'off';
      }
      break;
    }
    case 'ova': {
      powerStatus = 'off';
      break;
    }
    default: {
      powerStatus = 'unknown';
    }
  }
  return powerStatus;
};
