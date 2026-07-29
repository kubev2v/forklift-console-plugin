import { memo, useCallback, useMemo, useState } from 'react';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { Ec2VirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/Ec2VirtualMachinesList';
import { HypervVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/HypervVirtualMachinesList';
import { NutanixVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/NutanixVirtualMachinesList';
import { OpenShiftVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { getVmId } from 'src/providers/details/tabs/VirtualMachines/utils/helpers/vmProps';
import { VSphereVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';
import { useForkliftTranslation } from 'src/utils/i18n';

import useShowSelectedVmsToggle from '@components/SelectedToggle/useShowSelectedVmsToggle';
import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { EmptyState, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

type AddVirtualMachinesTableProps = {
  plan: V1beta1Plan;
  sourceProvider: V1beta1Provider;
  onSelect: (selectedVms: VmData[]) => void;
};

const AddVirtualMachinesTable = memo<AddVirtualMachinesTableProps>(
  ({ onSelect, plan, sourceProvider }) => {
    const { t } = useForkliftTranslation();
    const [inventoryVmData, isVmDataLoading] = useInventoryVms({ provider: sourceProvider });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const isFlatListSelectable = sourceProvider?.spec?.type !== PROVIDER_TYPES.vsphere;
    const { GlobalActionToolbarItems, showSelectedOnly } = useShowSelectedVmsToggle<VmData>(
      isFlatListSelectable,
      selectedIds,
    );

    const existingVmIds = useMemo((): Set<string> => {
      const planVms = getPlanVirtualMachines(plan);
      return new Set((planVms ?? []).map((vm) => vm.id).filter(Boolean) as string[]);
    }, [plan]);

    const availableVmData = useMemo(
      () => inventoryVmData.filter((vmData) => !existingVmIds.has(vmData.vm.id)),
      [inventoryVmData, existingVmIds],
    );

    const displayedVmData = useMemo(
      () =>
        showSelectedOnly
          ? availableVmData.filter((vmData) => selectedIds.includes(getVmId(vmData)))
          : availableVmData,
      [availableVmData, selectedIds, showSelectedOnly],
    );

    const handleSelect = useCallback(
      (selectedVmData: VmData[] | undefined): void => {
        const vms = selectedVmData ?? [];
        setSelectedIds(vms.map(getVmId));
        onSelect(vms);
      },
      [onSelect],
    );

    const tableProps: ProviderVirtualMachinesListProps = useMemo(
      () => ({
        ...(GlobalActionToolbarItems && { GlobalActionToolbarItems }),
        hasCriticalConcernFilter: true,
        initialSelectedIds: selectedIds,
        obj: {
          provider: sourceProvider,
          vmData: displayedVmData,
          vmDataLoading: isVmDataLoading,
        },
        onSelect: handleSelect,
        showActions: false,
        title: '',
      }),
      [
        GlobalActionToolbarItems,
        selectedIds,
        sourceProvider,
        displayedVmData,
        isVmDataLoading,
        handleSelect,
      ],
    );

    switch (sourceProvider?.spec?.type) {
      case PROVIDER_TYPES.openshift:
        return <OpenShiftVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.openstack:
        return <OpenStackVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.ovirt:
        return <OVirtVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.ova:
        return <OvaVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.hyperv:
        return <HypervVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.nutanix:
        return <NutanixVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.vsphere:
        return <VSphereVirtualMachinesList {...tableProps} />;
      case PROVIDER_TYPES.ec2:
        return <Ec2VirtualMachinesList {...tableProps} />;
      case undefined:
      default:
        return (
          <EmptyState
            titleText={
              <Title headingLevel="h4" size="lg">
                {t('Loading virtual machines...')}
              </Title>
            }
            variant={EmptyStateVariant.sm}
          >
            <Spinner size="xl" />
          </EmptyState>
        );
    }
  },
);
AddVirtualMachinesTable.displayName = 'AddVirtualMachinesTable';

export default AddVirtualMachinesTable;
