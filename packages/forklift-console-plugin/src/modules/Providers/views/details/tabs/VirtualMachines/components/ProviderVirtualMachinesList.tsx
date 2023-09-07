import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import StandardPage from 'src/components/page/StandardPage';
import { useProviderInventory, UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory, RowProps } from '@kubev2v/common';
import { ProviderVirtualMachine } from '@kubev2v/types';

import { getHighestPriorityConcern } from '../utils';

export interface VmData {
  vm: ProviderVirtualMachine;
  name: string;
  concerns: string;
}

export interface ProviderVirtualMachinesListProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  rowMapper: React.FunctionComponent<RowProps<VmData>>;
  fieldsMetadataFactory: ResourceFieldFactory;
  pageId: string;
}

export const ProviderVirtualMachinesList: React.FC<ProviderVirtualMachinesListProps> = ({
  obj,
  loaded,
  loadError,
  rowMapper,
  fieldsMetadataFactory,
  pageId,
}) => {
  const { t } = useForkliftTranslation();

  const [userSettings] = useState(() => loadUserSettings({ pageId }));

  const { provider, inventory } = obj;
  const { namespace } = provider.metadata;

  const largeInventory = inventory?.vmCount > 1000;
  const customTimeoutAndInterval = largeInventory ? 250000 : undefined;
  const validProvider = loaded && !loadError && provider;

  const inventoryOptions: UseProviderInventoryParams = {
    provider: validProvider,
    subPath: 'vms?detail=4',
    fetchTimeout: customTimeoutAndInterval,
    interval: customTimeoutAndInterval,
  };

  const {
    inventory: vms,
    loading,
    error,
  } = useProviderInventory<ProviderVirtualMachine[]>(inventoryOptions);

  const vmData: VmData[] =
    !loading && !error && vms
      ? vms.map((vm) => ({
          vm,
          name: vm.name,
          concerns: getHighestPriorityConcern(vm),
        }))
      : [];

  return (
    <StandardPage<VmData>
      data-testid="vm-list"
      dataSource={[vmData || [], !loading, null]}
      RowMapper={rowMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Virtual Machines')}
      userSettings={userSettings}
    />
  );
};
