import { memo, useCallback, useMemo, useState } from 'react';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { HypervVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/HypervVirtualMachinesList';
import { OpenShiftVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { getVmId } from 'src/providers/details/tabs/VirtualMachines/utils/helpers/vmProps';
import { VSphereVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { EmptyState, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

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

    const existingVmIds = useMemo((): Set<string> => {
      const planVms = getPlanVirtualMachines(plan);
      return new Set((planVms ?? []).map((vm) => vm.id).filter(Boolean) as string[]);
    }, [plan]);

    const availableVmData = useMemo(
      () => inventoryVmData.filter((vmData) => !existingVmIds.has(vmData.vm.id)),
      [inventoryVmData, existingVmIds],
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
        hasCriticalConcernFilter: true,
        initialSelectedIds: selectedIds,
        obj: {
          provider: sourceProvider,
          vmData: availableVmData,
          vmDataLoading: isVmDataLoading,
        },
        onSelect: handleSelect,
        showActions: false,
        title: '',
      }),
      [selectedIds, sourceProvider, availableVmData, isVmDataLoading, handleSelect],
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
      case PROVIDER_TYPES.vsphere:
        return <VSphereVirtualMachinesList {...tableProps} />;
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
