import React, { useState } from 'react';
import { defaultValueMatchers, FreetextFilter, ValueMatcher } from 'common/src/components/Filter';
import withQueryClient from 'common/src/components/QueryClientHoc';
import { loadUserSettings, StandardPage, UserSettings } from 'common/src/components/StandardPage';
import { Field } from 'common/src/components/types';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { Button } from '@patternfly/react-core';

import { FlatNetworkMapping, Network, useFlatNetworkMappings } from './data';
import NetworkMappingRow from './NetworkMappingRow';

const byName = {
  isVisible: true,
  filter: {
    type: 'freetext',
    toPlaceholderLabel: (t) => t('Filter by name'),
  },
  sortable: true,
};

export const fieldsMetadata: Field[] = [
  {
    id: C.NAME,
    toLabel: (t) => t('Name'),
    ...byName,
    isIdentity: true,
  },
  {
    id: C.NAMESPACE,
    toLabel: (t) => t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      toPlaceholderLabel: (t) => t('Filter by namespace'),
      type: 'freetext',
    },
    sortable: true,
  },
  {
    id: C.SOURCE,
    toLabel: (t) => t('Source provider'),
    ...byName,
  },
  {
    id: C.TARGET,
    toLabel: (t) => t('Target provider'),
    ...byName,
  },

  {
    id: C.FROM,
    toLabel: (t) => t('From'),
    isVisible: true,
    sortable: false,
  },
  {
    id: C.TO,
    toLabel: (t) => t('To'),
    isVisible: true,
    filter: {
      type: 'targetNetwork',
      toPlaceholderLabel: (t) => t('Filter by name'),
    },
    sortable: false,
  },
  {
    id: C.ACTIONS,
    toLabel: () => '',
    isVisible: true,
    sortable: false,
  },
];

export const NetworkMappingsPage = ({ namespace, kind: reference }: ResourceConsolePageProps) => {
  const { t } = useTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'NetworkMappings' }));
  const dataSource = useFlatNetworkMappings({
    namespace,
    groupVersionKind: groupVersionKindForReference(reference),
  });

  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('Network Mappings')}
      userSettings={userSettings}
    />
  );
};
NetworkMappingsPage.displayName = 'NetworkMappingsPage';

const Page = ({
  dataSource,
  namespace,
  title,
  userSettings,
}: {
  dataSource: [FlatNetworkMapping[], boolean, boolean];
  namespace: string;
  title: string;
  userSettings: UserSettings;
}) => (
  <StandardPage<FlatNetworkMapping>
    addButton={<AddNetworkMappingButton namespace={namespace} />}
    dataSource={dataSource}
    RowMapper={NetworkMappingRow}
    fieldsMetadata={fieldsMetadata}
    namespace={namespace}
    title={title}
    userSettings={userSettings}
    supportedFilters={{
      freetext: FreetextFilter,
      targetNetwork: FreetextFilter,
    }}
    supportedMatchers={[...defaultValueMatchers, targetNetworkMatcher]}
  />
);

const PageMemo = React.memo(Page);

const AddNetworkMappingButton: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();
  const launchModal = useModal();

  return (
    <Button
      variant="primary"
      onClick={() => launchModal(withQueryClient(AddMappingModal), { currentNamespace: namespace })}
    >
      {t('Create Mapping')}
    </Button>
  );
};
AddNetworkMappingButton.displayName = 'AddNetworkMappingButton';

const AddMappingModal: React.FC<{
  currentNamespace: string;
  closeModal: () => void;
}> = ({ closeModal, currentNamespace }) => {
  const { t } = useTranslation();
  return (
    <AddEditMappingModal
      onClose={closeModal}
      mappingBeingEdited={null}
      namespace={currentNamespace}
      isFixed
      title={t('Create Mapping')}
      mappingType={MappingType.Network}
      setActiveMapType={() => undefined}
    />
  );
};
AddMappingModal.displayName = 'AddMappingModal';

const targetNetworkMatcher: ValueMatcher = {
  filterType: 'targetNetwork',
  matchValue: (networks: Network[]) => (filter: string) =>
    networks.some((net) => {
      const name = net?.type === 'pod' ? 'pod' : net?.name ?? '';
      return name.includes(filter?.toLocaleLowerCase());
    }),
};

export default NetworkMappingsPage;
