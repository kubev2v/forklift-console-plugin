import React, { useState } from 'react';
import { commonFieldsMetadataFactory } from 'src/components/mappings/MappingPage';
import StandardPage from 'src/components/page/StandardPage';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { DefaultHeader, FreetextFilter, RowProps, TableViewHeaderProps } from '@kubev2v/common';
import { ValueMatcher } from '@kubev2v/common';
import { LoadingDots } from '@kubev2v/common';
import { loadUserSettings, UserSettings } from '@kubev2v/common';
import { withQueryClient } from '@kubev2v/common';
import { ResourceFieldFactory } from '@kubev2v/common';
import { AddEditMappingModal } from '@kubev2v/legacy/Mappings/components/AddEditMappingModal';
import { MappingType } from '@kubev2v/legacy/queries/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ToolbarItem } from '@patternfly/react-core';
import { Th } from '@patternfly/react-table';

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
  const [selected, setSelected]: [FlatNetworkMapping[], (selected: FlatNetworkMapping[]) => void] =
    useState([]);

  if (isLoading) {
    return <LoadingDots />;
  }

  if (loadedDataIsEmpty) {
    return <EmptyStateNetworkMaps namespace={namespace} />;
  }

  return (
    <StandardPage<FlatNetworkMapping>
      addButton={<AddNetworkMappingButton namespace={namespace} />}
      dataSource={dataSource}
      RowMapper={(props: RowProps<FlatNetworkMapping>) => {
        const isSelected = !!selected.find((it) => it === props.resourceData);
        return (
          <NetworkMappingRow
            {...props}
            isSelected={isSelected}
            toggleSelect={() =>
              setSelected([
                ...selected.filter((it) => it != props.resourceData),
                ...(isSelected ? [] : [props.resourceData]),
              ])
            }
          />
        );
      }}
      HeaderMapper={({ dataOnScreen, ...other }: TableViewHeaderProps<FlatNetworkMapping>) => {
        const allSelected = dataOnScreen.every((it) => selected.includes(it));
        return (
          <>
            <Th
              select={{
                onSelect: () =>
                  setSelected([
                    ...selected.filter((it) => !dataOnScreen.includes(it)),
                    ...(allSelected ? [] : dataOnScreen),
                  ]),
                isSelected: allSelected,
              }}
            />
            <DefaultHeader {...{ ...other, dataOnScreen }} />
          </>
        );
      }}
      GlobalActionToolbarItems={[
        ({ dataOnScreen }) => (
          <ToolbarItem>
            <Button onClick={() => console.warn('Action 1', dataOnScreen, selected)}>
              Action 1
            </Button>
          </ToolbarItem>
        ),
        ({ dataOnScreen }) => (
          <ToolbarItem>
            <Button onClick={() => console.warn('Action 2', dataOnScreen, selected)}>
              Action 2
            </Button>
          </ToolbarItem>
        ),
        ({ dataOnScreen }) => (
          <ToolbarItem>
            <Button onClick={() => console.warn('Action 3', dataOnScreen, selected)}>
              Action 3
            </Button>
          </ToolbarItem>
        ),
      ]}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={title}
      userSettings={userSettings}
      extraSupportedFilters={{
        targetNetwork: FreetextFilter,
      }}
      extraSupportedMatchers={[targetNetworkMatcher]}
    />
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
