import React, { useState } from 'react';
import { defaultValueMatchers, FreetextFilter, ValueMatcher } from 'common/src/components/Filter';
import withQueryClient from 'common/src/components/QueryClientHoc';
import { loadUserSettings, StandardPage, UserSettings } from 'common/src/components/StandardPage';
import { ResourceField } from 'common/src/components/types';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { Button } from '@patternfly/react-core';

import {
  commonFieldsMetadata,
  StartWithEmptyColumnMapper,
} from '../../components/mappings/MappingPage';

import { FlatNetworkMapping, Network, useFlatNetworkMappings } from './dataForNetwork';
import NetworkMappingRow from './NetworkMappingRow';

export const fieldsMetadata: ResourceField[] = [
  ...commonFieldsMetadata,
  {
    resourceFieldID: C.TO,
    label: 'To',
    isVisible: true,
    filter: {
      type: 'targetNetwork',
      toPlaceholderLabel: 'Filter by name',
    },
    sortable: false,
  },
  {
    resourceFieldID: C.ACTIONS,
    label: '',
    isAction: true,
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
      title={t('NetworkMaps')}
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
    HeaderMapper={StartWithEmptyColumnMapper}
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
      {t('Create NetworkMap')}
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
      title={t('Create NetworkMap')}
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
      return name.includes(filter?.trim()?.toLocaleLowerCase());
    }),
};

export default NetworkMappingsPage;
