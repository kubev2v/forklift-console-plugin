import { type FC, useMemo } from 'react';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import InventoryNotReachable from 'src/providers/list/components/InventoryNotReachable';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import {
  ProviderModel,
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import type { ProviderData } from '@utils/providers/types';

import { loadUserSettings } from '../../components/common/Page/userSettings';
import StandardPage from '../../components/page/StandardPage';
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
    <LearningExperienceDrawer>
      <StandardPage<ProviderData>
        addButton={
          <ProvidersAddButton
            canCreate={permissions.canCreate}
            namespace={namespace}
            testId="add-provider-button"
          />
        }
        alerts={
          !inventoryLoading && inventoryError
            ? [<InventoryNotReachable key={'inventoryNotReachable'} />]
            : undefined
        }
        customNoResultsFound={
          <ProvidersEmptyState canCreate={permissions.canCreate} namespace={namespace} />
        }
        data-testid="providers-list"
        dataSource={[data || [], providersLoaded, providersLoadError]}
        fieldsMetadata={providerFields}
        namespace={namespace}
        row={ProviderRow}
        shouldShowLearningExperienceButton
        title={t('Providers')}
        titleHelpContent={t(
          'Providers refer to environments where the virtual machines originate from or are moved to during the migration process.',
        )}
        userSettings={userSettings}
      />
    </LearningExperienceDrawer>
  );
};

export default ProvidersListPage;
