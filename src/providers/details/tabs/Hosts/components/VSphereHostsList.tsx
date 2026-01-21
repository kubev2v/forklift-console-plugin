import { type FC, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import type { GlobalActionToolbarProps } from 'src/components/common/utils/types';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  HostModelGroupVersionKind,
  type V1beta1Host,
  type VSphereHostInventory,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { hostsFields } from './utils/constants';
import { matchHostsToInventory } from './utils/matchHostsToInventory';
import type { InventoryHostNetworkTriple } from './utils/types';
import SelectNetworkForHostButton from './SelectNetworkForHostButton';
import VSphereHostsCells from './VSphereHostsCells';

type VSphereHostsListProps = {
  data: ProviderData;
};

const VSphereHostsList: FC<VSphereHostsListProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;
  const { namespace } = provider?.metadata ?? {};

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'ProviderHosts' }), []);

  const { inventory: inventoryHosts } = useProviderInventory<VSphereHostInventory[]>({
    provider,
    subPath: 'hosts?detail=4',
  });

  const [hosts, loaded, loadError] = useK8sWatchResource<V1beta1Host[]>({
    groupVersionKind: HostModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!provider || !namespace || !permissions || !inventoryHosts)
    return <Bullseye className="text-muted">{t('No data available.')}</Bullseye>;

  const hostsData = matchHostsToInventory(inventoryHosts, hosts, provider);

  const actions: FC<GlobalActionToolbarProps<InventoryHostNetworkTriple>>[] = [
    () => (
      <SelectNetworkForHostButton
        hostsData={hostsData}
        provider={provider}
        selectedIds={selectedIds}
      />
    ),
  ];

  const canPatchProps = permissions?.canPatch
    ? {
        canSelect: (item: InventoryHostNetworkTriple) => !isEmpty(item?.inventory?.networkAdapters),
        GlobalActionToolbarItems: actions,
        onSelect: setSelectedIds,
        selectedIds,
        toId: (item: InventoryHostNetworkTriple) => item.inventory.id,
      }
    : {};

  return (
    <StandardPageWithSelection<InventoryHostNetworkTriple>
      {...canPatchProps}
      dataSource={[hostsData || [], loaded, loadError]}
      fieldsMetadata={hostsFields}
      namespace={namespace}
      title={t('ESXi hosts')}
      userSettings={userSettings}
      cell={VSphereHostsCells}
    />
  );
};

export default VSphereHostsList;
