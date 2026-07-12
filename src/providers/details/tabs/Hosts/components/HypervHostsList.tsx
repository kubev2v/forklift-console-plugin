import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import type { ResourceField } from '@components/common/utils/types';
import { Bullseye } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import type { HypervHost } from '../types';

import HypervHostsCells from './HypervHostsCells';

const hypervHostsFields: ResourceField[] = [
  {
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.state',
    label: t('State'),
    resourceFieldId: 'state',
    sortable: true,
  },
  {
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.cpuSockets',
    label: t('CPU sockets'),
    resourceFieldId: 'cpuSockets',
    sortable: true,
  },
  {
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.cpuCores',
    label: t('CPU cores'),
    resourceFieldId: 'cpuCores',
    sortable: true,
  },
  {
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.memoryBytes',
    label: t('Memory'),
    resourceFieldId: 'memoryBytes',
    sortable: true,
  },
];

type HypervHostsListProps = {
  data: ProviderData;
};

const HypervHostsList: FC<HypervHostsListProps> = ({ data }) => {
  const { provider } = data;

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'HypervProviderHosts' }), []);

  const {
    error,
    inventory: inventoryHosts,
    loading,
  } = useProviderInventory<HypervHost[]>({
    provider,
    subPath: 'hosts?detail=4',
  });

  if (!provider) return <Bullseye className="text-muted">{t('No data available.')}</Bullseye>;

  return (
    <StandardPageWithSelection<HypervHost>
      dataSource={[inventoryHosts ?? [], !loading, error]}
      fieldsMetadata={hypervHostsFields}
      namespace={provider?.metadata?.namespace ?? undefined}
      title={t('Cluster hosts')}
      userSettings={userSettings}
      cell={HypervHostsCells}
    />
  );
};

export default HypervHostsList;
