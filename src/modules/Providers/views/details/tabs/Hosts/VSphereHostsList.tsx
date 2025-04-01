import React, { FC, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
  StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceFieldFactory } from '@components/common/utils/types';
import { HostModelGroupVersionKind, V1beta1Host, VSphereHost } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { SelectNetworkButton } from './components/SelectNetworkButton';
import { InventoryHostPair, matchHostsToInventory } from './utils/helpers/matchHostsToInventory';
import { ProviderHostsProps } from './ProviderHosts';
import { VSphereHostsCells } from './VSphereHostsRow';

const hostsFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.inventory.name',
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
    resourceFieldId: 'network',
    jsonPath: '$.networkAdapter.name',
    label: t('Network for data transfer'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by network'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'linkSpeed',
    jsonPath: '$.networkAdapter.linkSpeed',
    label: t('Bandwidth'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'mtu',
    jsonPath: '$.networkAdapter.mtu',
    label: t('MTU'),
    isVisible: true,
    sortable: true,
  },
];

const PageWithSelection = StandardPageWithSelection<InventoryHostPair>;
type PageWithSelectionProps = StandardPageWithSelectionProps<InventoryHostPair>;
type PageGlobalActions = FC<GlobalActionWithSelection<InventoryHostPair>>[];

export const VSphereHostsList: FC<ProviderHostsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const { provider, permissions } = obj;
  const { namespace } = provider?.metadata || {};

  const [selectedIds, setSelectedIds] = useState([]);
  const userSettings = loadUserSettings({ pageId: 'ProviderHosts' });

  const {
    inventory: hostsInventory,
    loading,
    error,
  } = useProviderInventory<VSphereHost[]>({
    provider,
    subPath: 'hosts?detail=4',
  });

  const [hosts] = useK8sWatchResource<V1beta1Host[]>({
    groupVersionKind: HostModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  const hostsData = matchHostsToInventory(hostsInventory, hosts, provider);

  const actions: PageGlobalActions = [
    ({ selectedIds }) => <SelectNetworkButton {...{ hostsData, provider, selectedIds }} />,
  ];

  const props: PageWithSelectionProps = {
    dataSource: [hostsData || [], !loading, error],
    CellMapper: VSphereHostsCells,
    fieldsMetadata: hostsFieldsMetadataFactory(t),
    namespace: namespace,
    title: t('Hosts'),
    userSettings: userSettings,
    page: 1,
  };

  const extendedProps: PageWithSelectionProps = permissions?.canPatch
    ? {
        ...props,
        toId: (item: InventoryHostPair) => item.inventory.id,
        canSelect: (item: InventoryHostPair) => item?.inventory?.networkAdapters?.length > 0,
        onSelect: setSelectedIds,
        selectedIds: selectedIds,
        GlobalActionToolbarItems: actions,
      }
    : props;

  return <PageWithSelection {...extendedProps} />;
};
