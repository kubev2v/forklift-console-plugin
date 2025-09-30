import type { FC } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';

import OffloadStorageIndexedForm from '../../components/OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import { defaultStorageMapping, StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import type { CreateStorageMapFormData } from '../types';

import InventorySourceStorageField from './InventorySourceStorageField';
import { validateStorageMaps } from './utils';

const CreateStorageMapFieldTable: FC = () => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const {
    control,
    formState: { isSubmitting },
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const [project, sourceProvider, targetProvider] = useWatch({
    control,
    name: [
      StorageMapFieldId.Project,
      StorageMapFieldId.SourceProvider,
      StorageMapFieldId.TargetProvider,
    ],
  });

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validateStorageMaps(values),
    },
  });

  const [sourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, _targetStoragesLoading, targetStoragesError] = useTargetStorages(
    targetProvider,
    project,
  );
  const loadError = sourceStoragesError ?? targetStoragesError;

  return (
    <FieldBuilderTable
      headers={[
        {
          isRequired: true,
          label: storageMapFieldLabels[StorageMapFieldId.SourceStorage],
          width: 45,
        },
        {
          isRequired: true,
          label: storageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 45,
        },
      ]}
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        ...(sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere &&
          isCopyOffloadEnabled && {
            additionalOptions: (
              <OffloadStorageIndexedForm index={index} sourceProvider={sourceProvider} />
            ),
          }),
        inputs: [
          <InventorySourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            sourceStorages={sourceStorages}
          />,
          <TargetStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
            targetStorages={targetStorages}
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          isEmpty([...sourceStorages, ...targetStorages]) ||
          sourceStorages.length === storageMappingFields.length ||
          sourceStoragesLoading ||
          isSubmitting ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append(defaultStorageMapping);
        },
      }}
      removeButton={{
        isDisabled: () => isSubmitting,
        onClick: (index) => {
          if (storageMappingFields.length > 1) {
            remove(index);
            return;
          }

          setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
        },
      }}
    />
  );
};

export default CreateStorageMapFieldTable;
