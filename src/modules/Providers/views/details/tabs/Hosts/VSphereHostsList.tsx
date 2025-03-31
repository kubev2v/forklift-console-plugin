import React, { type FC, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
  type StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceFieldFactory } from '@components/common/utils/types';
import { HostModelGroupVersionKind, type V1beta1Host, type VSphereHost } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { type InventoryHostPair, matchHostsToInventory } from './utils/helpers';
import { SelectNetworkButton } from './components';
import type { ProviderHostsProps } from './ProviderHosts';
import { VSphereHostsCells } from './VSphereHostsRow';

export const hostsFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.inventory.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by network'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: '$.networkAdapter.name',
    label: t('Network for data transfer'),
    resourceFieldId: 'network',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.networkAdapter.linkSpeed',
    label: t('Bandwidth'),
    resourceFieldId: 'linkSpeed',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.networkAdapter.mtu',
    label: t('MTU'),
    resourceFieldId: 'mtu',
    sortable: true,
  },
];

const PageWithSelection = StandardPageWithSelection<InventoryHostPair>;
type PageWithSelectionProps = StandardPageWithSelectionProps<InventoryHostPair>;
type PageGlobalActions = FC<GlobalActionWithSelection<InventoryHostPair>>[];

export const VSphereHostsList: FC<ProviderHostsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = obj;
  const { namespace } = provider?.metadata || {};

  const [selectedIds, setSelectedIds] = useState([]);
  const userSettings = loadUserSettings({ pageId: 'ProviderHosts' });

  const {
    error,
    inventory: hostsInventory,
    loading,
  } = useProviderInventory<VSphereHost[]>({
    provider,
    subPath: 'hosts?detail=4',
  });

  const [hosts] = useK8sWatchResource<V1beta1Host[]>({
    groupVersionKind: HostModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const hostsData = matchHostsToInventory(hostsInventory, hosts, provider);

  const actions: PageGlobalActions = [
    ({ selectedIds }) => <SelectNetworkButton {...{ hostsData, provider, selectedIds }} />,
  ];

  const props: PageWithSelectionProps = {
    CellMapper: VSphereHostsCells,
    dataSource: [hostsData || [], !loading, error],
    fieldsMetadata: hostsFieldsMetadataFactory(t),
    namespace,
    page: 1,
    title: t('Hosts'),
    userSettings,
  };

  const extendedProps: PageWithSelectionProps = permissions?.canPatch
    ? {
        ...props,
        canSelect: (item: InventoryHostPair) => item?.inventory?.networkAdapters?.length > 0,
        GlobalActionToolbarItems: actions,
        onSelect: setSelectedIds,
        selectedIds,
        toId: (item: InventoryHostPair) => item.inventory.id,
      }
    : props;

  return <PageWithSelection {...extendedProps} />;
};
