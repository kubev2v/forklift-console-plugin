import { type FC, useMemo } from 'react';

import { ProviderModel, ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { loadUserSettings } from '../../components/common/Page/userSettings';
import StandardPage from '../../components/page/StandardPage';
import useGetDeleteAndEditAccessReview from '../../modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import type { ProviderData } from '../../modules/Providers/utils/types/ProviderData';
import InventoryNotReachable from '../../modules/Providers/views/list/components/InventoryNotReachable';
import { useForkliftTranslation } from '../../utils/i18n';
import ProvidersAddButton from '../list/components/ProvidersAddButton';
import { findInventoryByID } from '../list/utils/findInventoryByID';

import ProviderRow from './components/ProviderRow';
import ProvidersEmptyState from './components/ProvidersEmptyState';
import useProvidersInventoryList from './hooks/useProvidersInventoryList';
import { providerFields } from './utils/providerFields';

import './ProvidersListPage.style.css';

const ProvidersListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'Providers' }), []);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const {
    error: inventoryError,
    inventory,
    loading: inventoryLoading,
  } = useProvidersInventoryList(namespace);

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data: ProviderData[] = useMemo(
    () =>
      (providers ?? []).map((provider) => ({
        inventory: findInventoryByID(inventory, provider.metadata?.uid),
        permissions,
        provider,
      })),
    [providers, inventory, permissions],
  );

  return (
    <StandardPage<ProviderData>
      data-testid="providers-list"
      addButton={
        <ProvidersAddButton
          testId="add-provider-button"
          namespace={namespace}
          canCreate={permissions.canCreate}
        />
      }
      dataSource={[data || [], providersLoaded, providersLoadError]}
      RowMapper={ProviderRow}
      fieldsMetadata={providerFields()}
      namespace={namespace}
      title={t('Providers')}
      titleHelpContent={t(
        'Providers refer to environments where the virtual machines originate from or are moved to during the migration process.',
      )}
      userSettings={userSettings}
      alerts={
        !inventoryLoading && inventoryError
          ? [<InventoryNotReachable key={'inventoryNotReachable'} />]
          : undefined
      }
      customNoResultsFound={
        <ProvidersEmptyState namespace={namespace} canCreate={permissions.canCreate} />
      }
      page={1}
    />
  );
};

export default ProvidersListPage;
