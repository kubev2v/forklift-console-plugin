import React, { useState } from 'react';
import {
  AddMappingButton,
  commonFieldsMetadataFactory,
  StartWithEmptyColumnMapper,
} from 'src/components/mappings/MappingPage';
import StandardPage from 'src/components/page/StandardPage';
import * as C from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { FreetextFilter, UserSettings } from '@kubev2v/common';
import { ValueMatcher } from '@kubev2v/common';
import { loadUserSettings } from '@kubev2v/common';
import { ResourceFieldFactory } from '@kubev2v/common';
import { MappingType } from '@kubev2v/legacy/queries/types';
import { StorageMapModel } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

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

  const [canCreate] = useAccessReview({
    group: StorageMapModel.apiGroup,
    resource: StorageMapModel.plural,
    verb: 'create',
    namespace,
  });

  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('StorageMaps')}
      userSettings={userSettings}
      canCreate={canCreate}
    />
  );
};
StorageMappingsPage.displayName = 'StorageMappingsPage';

const Page = ({
  dataSource,
  namespace,
  title,
  userSettings,
  canCreate,
}: {
  dataSource: [FlatStorageMapping[], boolean, boolean];
  namespace: string;
  title: string;
  userSettings: UserSettings;
  canCreate: boolean;
}) => {
  const { t } = useForkliftTranslation();

  return (
    <StandardPage<FlatStorageMapping>
      addButton={
        canCreate && (
          <AddMappingButton
            namespace={namespace}
            mappingType={MappingType.Storage}
            label={t('Create StorageMap')}
          />
        )
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
      customNoResultsFound={<EmptyStateStorageMaps namespace={namespace} />}
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
