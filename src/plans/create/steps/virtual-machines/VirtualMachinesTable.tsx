import { type FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { ProviderVirtualMachine } from '@kubev2v/types';

import { OpenShiftVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { VSphereVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { CreatePlanFormValues, ProviderType } from '../../constants';
import { useCreatePlanFieldWatch } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from './constants';

type VirtualMachinesTableProps = {
  field: ControllerRenderProps<CreatePlanFormValues, VmFormFieldId>;
};

export const VirtualMachinesTable: FC<VirtualMachinesTableProps> = ({ field }) => {
  const sourceProvider = useCreatePlanFieldWatch(GeneralFormFieldId.SourceProvider);
  const [vmData, vmDataLoading] = useInventoryVms({ provider: sourceProvider }, true, false);

  const tableProps = {
    initialSelectedIds: field.value ? Object.keys(field.value) : [],
    obj: { provider: sourceProvider, vmData, vmDataLoading },
    onSelect: (selectedVmData: VmData[]) => {
      const selectedVms = selectedVmData?.reduce(
        (acc: Record<string, ProviderVirtualMachine>, data) => ({
          ...acc,
          [data.vm.id]: data.vm,
        }),
        {},
      );

      field.onChange(selectedVms);
    },
    showActions: false,
    title: '',
  };

  switch (sourceProvider?.spec?.type) {
    case ProviderType.Openshift:
      return <OpenShiftVirtualMachinesList {...tableProps} />;
    case ProviderType.Openstack:
      return <OpenStackVirtualMachinesList {...tableProps} />;
    case ProviderType.Ovirt:
      return <OVirtVirtualMachinesList {...tableProps} />;
    case ProviderType.Ova:
      return <OvaVirtualMachinesList {...tableProps} />;
    case ProviderType.Vsphere:
      return <VSphereVirtualMachinesList {...tableProps} />;
    case undefined:
    default:
      return <></>;
  }
};

export default VirtualMachinesTable;
