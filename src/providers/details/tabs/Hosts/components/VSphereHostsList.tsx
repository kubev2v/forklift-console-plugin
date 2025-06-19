import { type FC, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { INITIAL_PAGE } from '@components/page/utils/constants';
import { HostModelGroupVersionKind, type V1beta1Host, type VSphereHost } from '@kubev2v/types';
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

  const { inventory: inventoryHosts } = useProviderInventory<VSphereHost[]>({
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

  const actions: FC[] = [
    () => <SelectNetworkForHostButton {...{ hostsData, provider, selectedIds }} />,
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
      page={INITIAL_PAGE}
      title={t('ESXi hosts')}
      userSettings={userSettings}
      CellMapper={VSphereHostsCells}
    />
  );
};

export default VSphereHostsList;
