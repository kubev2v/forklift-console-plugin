import React, { useState } from 'react';
import {
  AddMappingButton,
  commonFieldsMetadataFactory,
  StartWithEmptyColumnMapper,
} from 'src/components/mappings/MappingPage';
import StandardPage, { StandardPageProps } from 'src/components/page/StandardPage';
import * as C from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { FreetextFilter } from '@kubev2v/common';
import { ValueMatcher } from '@kubev2v/common';
import { LoadingDots } from '@kubev2v/common';
import { loadUserSettings } from '@kubev2v/common';
import { ResourceFieldFactory } from '@kubev2v/common';
import { MappingType } from '@kubev2v/legacy/queries/types';

import { FlatStorageMapping, Storage, useFlatStorageMappings } from './dataForStorage';
import EmptyStateStorageMaps from './EmptyStateStorageMaps';
import StorageMappingRow from './StorageMappingRow';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...commonFieldsMetadataFactory(t),
  {
    resourceFieldId: C.TO,
    label: t('To'),
    isVisible: true,
    filter: {
      type: 'targetStorage',
      placeholderLabel: t('Filter by name'),
    },
    sortable: false,
  },
  {
    resourceFieldId: C.ACTIONS,
    label: '',
    isVisible: true,
    isAction: true,
    sortable: false,
  },
];

export const StorageMappingsPage = ({ namespace }: ResourceConsolePageProps) => {
  const { t } = useForkliftTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'StorageMappings' }));
  const dataSource = useFlatStorageMappings({
    namespace,
  });

  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('StorageMaps')}
      userSettings={userSettings}
    />
  );
};
StorageMappingsPage.displayName = 'StorageMappingsPage';

const Page = ({
  dataSource,
  namespace,
  title,
  userSettings,
}: Partial<StandardPageProps<FlatStorageMapping>>) => {
  const { t } = useForkliftTranslation();

  const [data, isLoadSuccess, isLoadError] = dataSource;
  const isLoading = !isLoadSuccess && !isLoadError;
  const loadedDataIsEmpty = isLoadSuccess && !isLoadError && (data?.length ?? 0) === 0;

  if (isLoading) {
    return <LoadingDots />;
  }

  if (loadedDataIsEmpty) {
    return <EmptyStateStorageMaps namespace={namespace} />;
  }

  return (
    <StandardPage<FlatStorageMapping>
      addButton={
        <AddMappingButton
          namespace={namespace}
          mappingType={MappingType.Storage}
          label={t('Create StorageMap')}
        />
      }
      dataSource={dataSource}
      RowMapper={StorageMappingRow}
      HeaderMapper={StartWithEmptyColumnMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={namespace}
      title={title}
      userSettings={userSettings}
      extraSupportedFilters={{ targetStorage: FreetextFilter }}
      extraSupportedMatchers={[targetStorageMatcher]}
    />
  );
};

const PageMemo = React.memo(Page);

const targetStorageMatcher: ValueMatcher = {
  filterType: 'targetStorage',
  matchValue: (storages: Storage[]) => (filter: string) =>
    storages?.some((storage) => storage?.name?.includes(filter?.trim()) ?? false),
};

export default StorageMappingsPage;
