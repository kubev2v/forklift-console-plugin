import React, { useState } from 'react';
import * as C from 'src/utils/constants';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import { EnumToTuple } from '@kubev2v/common/components/Filter/helpers';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import {
  loadUserSettings,
  StandardPage,
  UserSettings,
} from '@kubev2v/common/components/StandardPage';
import { ResourceFieldFactory } from '@kubev2v/common/components/types';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { ProviderType, SOURCE_PROVIDER_TYPES } from '@kubev2v/legacy/common/constants';
import { AddEditProviderModal } from '@kubev2v/legacy/Providers/components/AddEditProviderModal';
import { Button } from '@patternfly/react-core';

import { MergedProvider, useProvidersWithInventory } from './data';
import EmptyStateProviders from './EmptyStateProviders';
import ProviderRow from './ProviderRow';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: C.NAME,
    jsonPath: '$.metadata.name',
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
    resourceFieldId: C.NAMESPACE,
    jsonPath: '$.metadata.namespace',
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by namespace'),
    },
    sortable: true,
  },
  {
    resourceFieldId: C.PHASE,
    jsonPath: '$.status.phase',
    label: t('Status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Status'),
      values: EnumToTuple(PROVIDER_STATUS),
    },
    sortable: true,
  },
  {
    resourceFieldId: C.URL,
    jsonPath: '$.spec.url',
    label: t('Endpoint'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by endpoint'),
    },
    sortable: true,
  },
  {
    resourceFieldId: C.TYPE,
    jsonPath: '$.spec.type',
    label: t('Type'),
    isVisible: true,
    filter: {
      type: 'groupedEnum',
      primary: true,
      placeholderLabel: t('Type'),
      values: EnumToTuple(PROVIDERS).map(({ id, ...rest }) => ({
        id,
        groupId: SOURCE_PROVIDER_TYPES.includes(id as ProviderType) ? 'source' : 'target',
        ...rest,
      })),
      groups: [
        { groupId: 'target', label: t('Target') },
        { groupId: 'source', label: t('Source') },
      ],
    },
    sortable: true,
  },
  {
    resourceFieldId: C.VM_COUNT,
    jsonPath: '$.inventory.vmCount',
    label: t('VMs'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: C.NETWORK_COUNT,
    jsonPath: '$.inventory.networkCount',
    label: t('Networks'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: C.CLUSTER_COUNT,
    jsonPath: '$.inventory.clusterCount',
    label: t('Clusters'),
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldId: C.HOST_COUNT,
    jsonPath: '$.inventory.hostCount',
    label: t('Hosts'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: C.STORAGE_COUNT,
    jsonPath: '$.inventory.storageCount',
    label: t('Storage'),
    isVisible: false,
    sortable: true,
  },
  {
    resourceFieldId: C.ACTIONS,
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
  dataSource: [MergedProvider[], boolean, unknown, unknown, unknown];
  namespace: string;
  title: string;
  userSettings: UserSettings;
}> = ({ dataSource, namespace, title, userSettings }) => {
  const { t } = useTranslation();

  const [data, loaded, error] = dataSource;
  const loadedDataIsEmpty = loaded && !error && data?.length === 0;

  return loadedDataIsEmpty ? (
    <EmptyStateProviders namespace={namespace} />
  ) : (
    <StandardPage<MergedProvider>
      addButton={<AddProviderButton namespace={namespace} />}
      dataSource={[data, loaded, error]}
      RowMapper={ProviderRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
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
