import type { FC } from 'react';
import { OpenShiftVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { VSphereVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

const ProviderVirtualMachinesListWrapper: FC<ProviderVirtualMachinesListProps> = (props) => {
  switch (props.obj?.provider?.spec?.type) {
    case 'openshift':
      return <OpenShiftVirtualMachinesList {...props} />;
    case 'openstack':
      return <OpenStackVirtualMachinesList {...props} />;
    case 'ovirt':
      return <OVirtVirtualMachinesList {...props} />;
    case 'vsphere':
      return <VSphereVirtualMachinesList {...props} />;
    case 'ova':
      return <OvaVirtualMachinesList {...props} />;
    case undefined:
    default:
      // unsupported provider or loading errors will be handled by parent page
      return <></>;
  }
};

export default ProviderVirtualMachinesListWrapper;
