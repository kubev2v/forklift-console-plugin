import { type FC, useMemo } from 'react';
import { type ControllerRenderProps, useWatch } from 'react-hook-form';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { OpenShiftVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { VSphereVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import type { ProviderVirtualMachine } from '@kubev2v/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { CreatePlanFormData } from '../../types';
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
    case PROVIDER_TYPES.openshift:
      return <OpenShiftVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.openstack:
      return <OpenStackVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.ovirt:
      return <OVirtVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.ova:
      return <OvaVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.vsphere:
      return <VSphereVirtualMachinesList {...tableProps} />;
    case undefined:
    default:
      return <></>;
  }
};

export default VirtualMachinesTable;
