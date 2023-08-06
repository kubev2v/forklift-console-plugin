import React, { useCallback, useState } from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  DefaultHeader,
  loadUserSettings,
  ResourceFieldFactory,
  RowProps,
  TableViewHeaderProps,
} from '@kubev2v/common';
import { HostModelGroupVersionKind, V1beta1Host, VSphereHost } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';
import { Th } from '@patternfly/react-table';

import { VSphereNetworkModal } from './modals/VSphereNetworkModal';
import { InventoryHostPair, matchHostsToInventory } from './utils/helpers';
import { ProviderHostsProps } from './ProviderHosts';
import { VSphereHostsRow } from './VSphereHostsRow';

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

export const VSphereHostsList: React.FC<ProviderHostsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const [userSettings] = useState(() => loadUserSettings({ pageId: 'ProviderHosts' }));
  const [selected, setSelected]: [string[], (selected: string[]) => void] = useState([]);

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

  const RowMapper = React.useCallback(
    (props: RowProps<InventoryHostPair>) => {
      const isSelected = selected.includes(props.resourceData.inventory.id);

      const handleToggle = () => {
        const newSelected = selected.filter((id) => id !== props.resourceData.inventory.id);
        setSelected(isSelected ? newSelected : [...newSelected, props.resourceData.inventory.id]);
      };

      return (
        <VSphereHostsRow
          {...props}
          isSelected={isSelected}
          toggleSelect={permissions.canPatch ? handleToggle : undefined}
        />
      );
    },
    [selected, permissions],
  );

  const HeaderMapper = React.useCallback(
    ({ dataOnScreen, ...other }: TableViewHeaderProps<InventoryHostPair>) => {
      const selectableItems = dataOnScreen.filter((d) => d?.inventory?.networkAdapters?.length > 0);
      const selectableIDs = selectableItems.map((d) => d?.inventory?.id);
      const allSelected = selectableIDs.every((id) => selected.includes(id));

      const handleSelect = () => {
        const selectableNotSelected = selectableIDs.filter((id) => !selected.includes(id));
        setSelected(
          allSelected
            ? selected.filter((id) => !selectableIDs.includes(id)) // Unselect all
            : [...selected, ...selectableNotSelected], // Select all
        );
      };

      return (
        <>
          {permissions.canPatch && (
            <Th
              select={{
                onSelect: handleSelect,
                isSelected: allSelected,
                isHeaderSelectDisabled: selectableItems.length === 0, // Disable if no selectable items
              }}
            />
          )}
          <DefaultHeader {...{ ...other, dataOnScreen }} />
        </>
      );
    },
    [selected, permissions],
  );

  const AddButton = useCallback(
    () => (
      <Button
        variant="secondary"
        onClick={() =>
          showModal(
            <VSphereNetworkModal provider={provider} data={hostsData} selected={selected} />,
          )
        }
        isDisabled={selected.length === 0}
      >
        {t('Select migration network')}
      </Button>
    ),
    [selected],
  );

  return (
    <StandardPage<InventoryHostPair>
      data-testid="hosts-list"
      addButton={permissions.canPatch && <AddButton />}
      dataSource={[hostsData || [], !loading, error]}
      RowMapper={RowMapper}
      HeaderMapper={HeaderMapper}
      fieldsMetadata={hostsFieldsMetadataFactory(t)}
      namespace={namespace}
      title={t('Hosts')}
      userSettings={userSettings}
    />
  );
};
