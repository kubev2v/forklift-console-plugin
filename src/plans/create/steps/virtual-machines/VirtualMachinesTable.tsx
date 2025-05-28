import { type FC, useMemo } from 'react';
import { type ControllerRenderProps, useWatch } from 'react-hook-form';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { OpenShiftVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { VSphereVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import type { ProviderVirtualMachine } from '@kubev2v/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { type CreatePlanFormData, ProviderType } from '../../types';
import { GeneralFormFieldId } from '../general-information/constants';

import type { VmFormFieldId } from './constants';

type VirtualMachinesTableProps = {
  vmData?: VmData[];
  initialSelectedIds?: string[];
  value: Record<string, ProviderVirtualMachine> | undefined;
  onChange?: ControllerRenderProps<CreatePlanFormData, VmFormFieldId>['onChange'];
  isSelectable?: boolean;
  showSelectedOnly?: boolean;
  hasCriticalConcernFilter?: boolean;
};

const VirtualMachinesTable: FC<VirtualMachinesTableProps> = ({
  hasCriticalConcernFilter,
  initialSelectedIds,
  isSelectable,
  onChange,
  showSelectedOnly,
  value,
  vmData: customVmData,
}) => {
  const { control } = useCreatePlanFormContext();
  const sourceProvider = useWatch({ control, name: GeneralFormFieldId.SourceProvider });
  const [providerVmData, isVmDataLoading] = useInventoryVms({ provider: sourceProvider });

  // Use custom VM data if provided, otherwise use fetched VM data
  const availableVmData = customVmData ?? providerVmData;

  const displayedVmData = useMemo(
    () =>
      showSelectedOnly
        ? availableVmData?.filter((data) => Boolean(value?.[data.vm.id]))
        : availableVmData,
    [availableVmData, showSelectedOnly, value],
  );

  const tableProps: ProviderVirtualMachinesListProps = useMemo(
    () => ({
      ...(isSelectable && {
        initialSelectedIds: value ? Object.keys(value) : (initialSelectedIds ?? []),
        onSelect: (selectedVmData: VmData[] | undefined) => {
          const selectedVms = selectedVmData?.reduce(
            (acc: Record<string, ProviderVirtualMachine>, data) => ({
              ...acc,
              [data.vm.id]: data.vm,
            }),
            {},
          );

          onChange?.(selectedVms);
        },
      }),
      hasCriticalConcernFilter,
      obj: {
        provider: sourceProvider,
        vmData: displayedVmData,
        vmDataLoading: isVmDataLoading,
      },
      showActions: false,
      title: '',
    }),
    [
      isSelectable,
      value,
      initialSelectedIds,
      hasCriticalConcernFilter,
      sourceProvider,
      displayedVmData,
      isVmDataLoading,
      onChange,
    ],
  );

  // Render the appropriate VM list component based on provider type
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
