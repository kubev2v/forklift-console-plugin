import React, { FC, useState } from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { GlobalActionWithSelection, withIdBasedSelection } from 'src/components/page/withSelection';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import {
  HostModelGroupVersionKind,
  V1beta1Host,
  V1beta1Provider,
  VSphereHost,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ToolbarItem } from '@patternfly/react-core';

import { VSphereNetworkModal } from './modals/VSphereNetworkModal';
import { InventoryHostPair, matchHostsToInventory } from './utils/helpers';
import { ProviderHostsProps } from './ProviderHosts';
import { VSphereHostsCells } from './VSphereHostsRow';

export const hostsFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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

const PageWithSelection = withIdBasedSelection<InventoryHostPair>({
  toId: (item: InventoryHostPair) => item.inventory.id,
  canSelect: (item: InventoryHostPair) => item?.inventory?.networkAdapters?.length > 0,
});

export const VSphereHostsList: FC<ProviderHostsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const [userSettings] = useState(() => loadUserSettings({ pageId: 'ProviderHosts' }));

  const { provider, permissions } = obj;
  const { namespace } = provider?.metadata || {};

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

  const Page = permissions?.canPatch ? PageWithSelection : StandardPage<InventoryHostPair>;
  const actions: FC<GlobalActionWithSelection<InventoryHostPair>>[] = permissions?.canPatch
    ? [({ selectedIds }) => <SelectNetworkBtn {...{ hostsData, provider, selectedIds }} />]
    : [];

  return (
    <Page
      data-testid="hosts-list"
      dataSource={[hostsData || [], !loading, error]}
      CellMapper={VSphereHostsCells}
      fieldsMetadata={hostsFieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Hosts')}
      userSettings={userSettings}
      GlobalActionToolbarItems={actions}
    />
  );
};

const SelectNetworkBtn: FC<{
  selectedIds: string[];
  provider: V1beta1Provider;
  hostsData: InventoryHostPair[];
}> = ({ selectedIds, provider, hostsData }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  return (
    <ToolbarItem>
      <Button
        variant="secondary"
        onClick={() =>
          showModal(
            <VSphereNetworkModal provider={provider} data={hostsData} selected={selectedIds} />,
          )
        }
        isDisabled={!selectedIds?.length}
      >
        {t('Select migration network')}
      </Button>
    </ToolbarItem>
  );
};
