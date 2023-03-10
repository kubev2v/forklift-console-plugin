import React, { useState } from 'react';
import * as C from 'src/utils/constants';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import { fromI18nEnum } from '@kubev2v/common/components/Filter/helpers';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import {
  loadUserSettings,
  StandardPage,
  UserSettings,
} from '@kubev2v/common/components/StandardPage';
import { ResourceField } from '@kubev2v/common/components/types';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { ProviderType, SOURCE_PROVIDER_TYPES } from '@kubev2v/legacy/common/constants';
import { AddEditProviderModal } from '@kubev2v/legacy/Providers/components/AddEditProviderModal';
import { Button } from '@patternfly/react-core';

import { MergedProvider, useProvidersWithInventory } from './data';
import EmptyStateProviders from './EmptyStateProviders';
import ProviderRow from './ProviderRow';

export const fieldsMetadata: ResourceField[] = [
  {
    resourceFieldID: C.NAME,
    label: 'Name',
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by name',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.NAMESPACE,
    label: 'Namespace',
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by namespace',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.PHASE,
    label: 'Status',
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: 'Status',
      values: fromI18nEnum(PROVIDER_STATUS),
    },
    sortable: true,
  },
  {
    resourceFieldID: C.URL,
    label: 'Endpoint',
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by endpoint',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.TYPE,
    label: 'Type',
    isVisible: true,
    filter: {
      type: 'groupedEnum',
      primary: true,
      toPlaceholderLabel: 'Type',
      values: fromI18nEnum(PROVIDERS).map(({ id, ...rest }) => ({
        id,
        groupId: SOURCE_PROVIDER_TYPES.includes(id as ProviderType) ? 'source' : 'target',
        ...rest,
      })),
      groups: [
        { groupId: 'target', label: 'Target' },
        { groupId: 'source', label: 'Source' },
      ],
    },
    sortable: true,
  },
  {
    resourceFieldID: C.VM_COUNT,
    label: 'VMs',
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldID: C.NETWORK_COUNT,
    label: 'Networks',
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldID: C.CLUSTER_COUNT,
    label: 'Clusters',
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldID: C.HOST_COUNT,
    label: 'Hosts',
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldID: C.STORAGE_COUNT,
    label: 'Storage',
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldID: C.ACTIONS,
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
];

const ProvidersPage: React.FC<ResourceConsolePageProps> = ({ namespace, kind: reference }) => {
  const { t } = useTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'Providers' }));
  const dataSource = useProvidersWithInventory({
    namespace,
    groupVersionKind: groupVersionKindForReference(reference),
  });

  // data hook triggers frequent re-renders although data remains the same:
  // both the content content and object reference
  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('Providers')}
      userSettings={userSettings}
    />
  );
};
ProvidersPage.displayName = 'ProvidersPage';

const Page: React.FC<{
  dataSource: [MergedProvider[], boolean, boolean];
  namespace: string;
  title: string;
  userSettings: UserSettings;
}> = ({ dataSource, namespace, title, userSettings }) => {
  const [data, loaded, error] = dataSource;
  const loadedDataIsEmpty = loaded && !error && data?.length === 0;

  return loadedDataIsEmpty ? (
    <EmptyStateProviders namespace={namespace} />
  ) : (
    <StandardPage<MergedProvider>
      addButton={<AddProviderButton namespace={namespace} />}
      dataSource={dataSource}
      RowMapper={ProviderRow}
      fieldsMetadata={fieldsMetadata}
      namespace={namespace}
      title={title}
      userSettings={userSettings}
    />
  );
};

const PageMemo = React.memo(Page);

const AddProviderButton: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();
  const launchModal = useModal();

  return (
    <Button
      variant="primary"
      onClick={() =>
        launchModal(withQueryClient(AddProviderModal), { currentNamespace: namespace })
      }
    >
      {t('Create Provider')}
    </Button>
  );
};
AddProviderButton.displayName = 'AddProviderButton';

const AddProviderModal: React.FC<{
  currentNamespace: string;
  closeModal: () => void;
}> = ({ closeModal, currentNamespace }) => {
  return (
    <AddEditProviderModal
      onClose={closeModal}
      providerBeingEdited={null}
      namespace={currentNamespace}
    />
  );
};
AddProviderModal.displayName = 'AddProviderModal';

export default ProvidersPage;
export { AddProviderButton };
