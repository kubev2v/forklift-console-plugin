import type { FC } from 'react';

import { ProviderModel, ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { loadUserSettings } from '../../components/common/Page/userSettings';
import StandardPage from '../../components/page/StandardPage';
import useGetDeleteAndEditAccessReview from '../../modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import type { ProviderData } from '../../modules/Providers/utils/types/ProviderData.ts';
import InventoryNotReachable from '../../modules/Providers/views/list/components/InventoryNotReachable';
import ProviderRow from '../../modules/Providers/views/list/ProviderRow';
import { useForkliftTranslation } from '../../utils/i18n';
import ProvidersAddButton from '../list/components/ProvidersAddButton';
import { findInventoryByID } from '../list/utils/findInventoryByID';

import ProvidersEmptyState from './components/ProvidersEmptyState';
import useProvidersInventoryList from './hooks/useProvidersInventoryList';
import { providerFields } from './utils/providerFields';

import './ProvidersListPage.style.css';

const ProvidersListPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Providers' });

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
  } = useProvidersInventoryList({ namespace });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data: ProviderData[] = (providersLoaded && !providersLoadError ? providers : []).map(
    (provider) => ({
      inventory: findInventoryByID(inventory, provider.metadata?.uid),
      permissions,
      provider,
    }),
  );

  const EmptyState = (
    <ProvidersEmptyState
      AddButton={
        <ProvidersAddButton
          dataTestId="add-provider-button-empty-state"
          namespace={namespace}
          canCreate={permissions.canCreate}
        />
      }
      namespace={namespace}
    />
  );

  return (
    <StandardPage<ProviderData>
      data-testid="providers-list"
      addButton={
        <ProvidersAddButton
          dataTestId="add-provider-button"
          namespace={namespace}
          canCreate={permissions.canCreate}
        />
      }
      dataSource={[data || [], providersLoaded, providersLoadError]}
      RowMapper={ProviderRow}
      fieldsMetadata={providerFields(t)}
      namespace={namespace}
      title={t('Providers')}
      userSettings={userSettings}
      alerts={
        !inventoryLoading && inventoryError
          ? [<InventoryNotReachable key={'inventoryNotReachable'} />]
          : undefined
      }
      customNoResultsFound={EmptyState}
      page={1}
    />
  );
};

export default ProvidersListPage;
