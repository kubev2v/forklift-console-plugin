import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import StandardPage from 'src/components/page/StandardPage';
import { useProviderInventory, UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EnumToTuple, loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import { ProviderVirtualMachine } from '@kubev2v/types';

import { ProviderVirtualMachinesRow, VmData } from './ProviderVirtualMachinesRow';
import { getHighestPriorityConcern } from './utils';

export const vmsFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'concerns',
    jsonPath: '$.concerns',
    label: t('Concerns'),
    isVisible: true,
    sortable: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Concerns'),
      values: EnumToTuple({ Critical: 'Critical', Warning: 'Warning', Information: 'Information' }),
    },
  },
];

interface ProviderVirtualMachinesProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderVirtualMachines: React.FC<ProviderVirtualMachinesProps> = ({
  obj,
  loaded,
  loadError,
}) => {
  const { t } = useForkliftTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'ProviderVMs' }));

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
      RowMapper={ProviderVirtualMachinesRow}
      fieldsMetadata={vmsFieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Virtual Machines')}
      userSettings={userSettings}
    />
  );
};
