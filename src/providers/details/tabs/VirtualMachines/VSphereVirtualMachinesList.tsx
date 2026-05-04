import type { FC } from 'react';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import LoadingSuspend from '@components/LoadingSuspend';
import VsphereFolderTreeTable from '@components/VsphereFoldersTable/VsphereFolderTreeTable';
import { getNamespace, getUID } from '@utils/crds/common/selectors';

import { useVSphereInventoryVms } from './utils/hooks/useVSphereInventoryVms';

export const VSphereVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  initialSelectedIds,
  obj,
  onSelect,
}) => {
  const { provider, vmData, vmDataLoading } = obj ?? {};

  const [hostsDict, foldersDict, isVsphereInventoryLoading] = useVSphereInventoryVms(
    { provider },
    true,
    null,
  );

  const isLoading = Boolean(vmDataLoading) || isVsphereInventoryLoading;
  if (isLoading) {
    return <LoadingSuspend />;
  }

  return (
    <VsphereFolderTreeTable
      foldersDict={foldersDict}
      hostsDict={hostsDict}
      initialSelectedIds={initialSelectedIds}
      onSelect={onSelect}
      providerNamespace={provider ? getNamespace(provider) : undefined}
      providerUid={provider ? getUID(provider) : undefined}
      vmData={vmData}
    />
  );
};
