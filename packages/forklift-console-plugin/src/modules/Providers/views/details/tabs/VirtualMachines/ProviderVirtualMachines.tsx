import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import StandardPage from 'src/components/page/StandardPage';
import { useProviderInventory, UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EnumToTuple, loadUserSettings, ResourceFieldFactory, RowProps } from '@kubev2v/common';
import {
  ProviderInventory,
  ProviderModelGroupVersionKind,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { OpenStackVirtualMachinesList } from './OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from './OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from './OVirtVirtualMachinesList';
import { ProviderVirtualMachinesRow, VmData } from './ProviderVirtualMachinesRow';
import { getHighestPriorityConcern } from './utils';
import { VSphereVirtualMachinesList } from './VSphereVirtualMachinesList';

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

export interface ProviderVirtualMachinesProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  rowMapper?: React.FunctionComponent<RowProps<VmData>>;
  fieldsMetadataFactory?: ResourceFieldFactory;
}

export const ProviderVirtualMachines: React.FC<ProviderVirtualMachinesProps> = ({
  obj,
  loaded,
  loadError,
  rowMapper = ProviderVirtualMachinesRow,
  fieldsMetadataFactory = vmsFieldsMetadataFactory,
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
      RowMapper={rowMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Virtual Machines')}
      userSettings={userSettings}
    />
  );
};

export const ProviderVirtualMachinesWrapper: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });

  const data = { provider, inventory };
  switch (provider?.spec?.type) {
    case 'openshift':
      return <ProviderVirtualMachines obj={data} loaded={providerLoaded} />;
    case 'openstack':
      return (
        <OpenStackVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'ovirt':
      return (
        <OVirtVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'vsphere':
      return (
        <VSphereVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'ova':
      return <OvaVirtualMachinesList obj={data} loaded={providerLoaded} />;
    default:
      // unsupported provider or loading errors will be handled by parent page
      return <></>;
  }
};
