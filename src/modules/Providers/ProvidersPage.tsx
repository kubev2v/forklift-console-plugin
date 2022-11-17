import React from 'react';
import { fromI18nEnum } from '_/components/Filter/helpers';
import withQueryClient from '_/components/QueryClientHoc';
import { StandardPage } from 'src/components/StandardPage';
import { Field } from 'src/components/types';
import * as C from 'src/utils/constants';
import { CONDITIONS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { AddEditProviderModal } from '@app/Providers/components/AddEditProviderModal';
import { EditProviderContext } from '@app/Providers/ProvidersPage';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';

import { MergedProvider, useProvidersWithInventory } from './data';
import ProviderRow from './ProviderRow';

const fieldsMetadata: Field[] = [
  {
    id: C.NAME,
    toLabel: (t) => t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by name'),
    },
    sortable: true,
  },
  {
    id: C.NAMESPACE,
    toLabel: (t) => t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by namespace'),
    },
    sortable: true,
  },
  {
    id: C.READY,
    toLabel: (t) => t('Ready'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: (t) => t('Ready'),
      values: fromI18nEnum(CONDITIONS),
    },
    sortable: true,
  },
  {
    id: C.URL,
    toLabel: (t) => t('Endpoint'),
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by endpoint'),
    },
    sortable: true,
  },
  {
    id: C.TYPE,
    toLabel: (t) => t('Type'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: (t) => t('Type'),
      values: fromI18nEnum(PROVIDERS),
    },
    sortable: true,
  },
  {
    id: C.VM_COUNT,
    toLabel: (t) => t('VMs'),
    isVisible: true,
    sortable: true,
  },
  {
    id: C.NETWORK_COUNT,
    toLabel: (t) => t('Networks'),
    isVisible: true,
    sortable: true,
  },
  {
    id: C.CLUSTER_COUNT,
    toLabel: (t) => t('Clusters'),
    isVisible: false,
    sortable: true,
  },
  {
    id: C.HOST_COUNT,
    toLabel: (t) => t('Hosts'),
    isVisible: true,
    sortable: true,
  },
  {
    id: C.STORAGE_COUNT,
    toLabel: (t) => t('Storage'),
    isVisible: false,
    sortable: true,
  },
  {
    id: C.ACTIONS,
    toLabel: () => '',
    isVisible: true,
    sortable: false,
  },
];

export const ProvidersPage = ({ namespace, kind }: ResourceConsolePageProps) => {
  const { t } = useTranslation();

  const dataSource = useProvidersWithInventory({
    kind,
    namespace,
  });

  // data hook triggers frequent re-renders although data remains the same:
  // both the content content and object reference
  return <PageMemo dataSource={dataSource} namespace={namespace} title={t('Providers')} />;
};

const Page = ({
  dataSource,
  namespace,
  title,
}: {
  dataSource: [MergedProvider[], boolean, boolean];
  namespace: string;
  title: string;
}) => (
  <StandardPage<MergedProvider>
    addButton={<AddProviderButton />}
    dataSource={dataSource}
    RowMapper={ProviderRow}
    fieldsMetadata={fieldsMetadata}
    namespace={namespace}
    title={title}
  />
);

const PageMemo = React.memo(Page);

const AddProviderButton = () => {
  const { t } = useTranslation();
  const launchModal = useModal();

  return (
    <Button variant="primary" onClick={() => launchModal(withQueryClient(AddProviderModal), {})}>
      {t('Add Provider')}
    </Button>
  );
};

const AddProviderModal = ({ closeModal }: { closeModal: () => void }) => {
  return (
    <EditProviderContext.Provider value={{ openEditProviderModal: () => undefined, plans: [] }}>
      <AddEditProviderModal onClose={closeModal} providerBeingEdited={null} />
    </EditProviderContext.Provider>
  );
};

export default ProvidersPage;
