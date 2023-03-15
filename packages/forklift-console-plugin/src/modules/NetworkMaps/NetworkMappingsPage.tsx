import React, { useState } from 'react';
import {
  commonFieldsMetadataFactory,
  StartWithEmptyColumnMapper,
} from 'src/components/mappings/MappingPage';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import {
  defaultValueMatchers,
  FreetextFilter,
  SwitchFilter,
  ValueMatcher,
} from '@kubev2v/common/components/Filter';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import {
  loadUserSettings,
  StandardPage,
  UserSettings,
} from '@kubev2v/common/components/StandardPage';
import { ResourceFieldFactory } from '@kubev2v/common/components/types';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { AddEditMappingModal } from '@kubev2v/legacy/Mappings/components/AddEditMappingModal';
import { MappingType } from '@kubev2v/legacy/queries/types';
import { Button } from '@patternfly/react-core';

import { FlatNetworkMapping, Network, useFlatNetworkMappings } from './dataForNetwork';
import EmptyStateNetworkMaps from './EmptyStateNetworkMaps';
import NetworkMappingRow from './NetworkMappingRow';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...commonFieldsMetadataFactory(t),
  {
    resourceFieldId: C.TO,
    label: t('To'),
    isVisible: true,
    filter: {
      type: 'targetNetwork',
      placeholderLabel: t('Filter by name'),
    },
    sortable: false,
  },
  {
    resourceFieldId: C.ACTIONS,
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
];

export const NetworkMappingsPage = ({ namespace }: ResourceConsolePageProps) => {
  const { t } = useTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'NetworkMappings' }));
  const dataSource = useFlatNetworkMappings({
    namespace,
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
}) => {
  const { t } = useTranslation();

  const [data, isLoadSuccess, isLoadError] = dataSource;
  const isLoading = !isLoadSuccess && !isLoadError;
  const loadedDataIsEmpty = isLoadSuccess && !isLoadError && (data?.length ?? 0) === 0;

  return (
    <>
      {loadedDataIsEmpty && <EmptyStateNetworkMaps namespace={namespace} />}

      {(isLoading || !loadedDataIsEmpty) && (
        <StandardPage<FlatNetworkMapping>
          addButton={<AddNetworkMappingButton namespace={namespace} />}
          dataSource={dataSource}
          RowMapper={NetworkMappingRow}
          HeaderMapper={StartWithEmptyColumnMapper}
          fieldsMetadata={fieldsMetadataFactory(t)}
          namespace={namespace}
          title={title}
          userSettings={userSettings}
          supportedFilters={{
            freetext: FreetextFilter,
            targetNetwork: FreetextFilter,
            slider: SwitchFilter,
          }}
          supportedMatchers={[...defaultValueMatchers, targetNetworkMatcher]}
        />
      )}
    </>
  );
};

const PageMemo = React.memo(Page);

export const AddNetworkMappingButton: React.FC<{ namespace: string }> = ({ namespace }) => {
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
