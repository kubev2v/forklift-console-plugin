import React, { useState } from 'react';
import { defaultValueMatchers, FreetextFilter, ValueMatcher } from 'common/src/components/Filter';
import {
  loadUserSettings,
  StandardPage,
  StandardPageProps,
} from 'common/src/components/StandardPage';
import { ResourceFieldFactory } from 'common/src/components/types';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import {
  AddMappingButton,
  commonFieldsMetadataFactory,
  StartWithEmptyColumnMapper,
} from '../../components/mappings/MappingPage';

import { FlatStorageMapping, Storage, useFlatStorageMappings } from './dataForStorage';
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

export const StorageMappingsPage = ({ namespace, kind: reference }: ResourceConsolePageProps) => {
  const { t } = useTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'StorageMappings' }));
  const dataSource = useFlatStorageMappings({
    namespace,
    groupVersionKind: groupVersionKindForReference(reference),
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
  const { t } = useTranslation();

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
      supportedFilters={{
        freetext: FreetextFilter,
        targetStorage: FreetextFilter,
      }}
      supportedMatchers={[...defaultValueMatchers, targetStorageMatcher]}
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
