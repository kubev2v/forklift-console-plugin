import type { FC } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import TargetStorageWithSuggestion from 'src/storageMaps/components/TargetStorageWithSuggestion';
import { defaultStorageMapping, storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';
import { useSourceStorages } from 'src/utils/hooks/useStorages';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';

import OffloadStorageRow from '../../components/OffloadStorageIndexedForm/OffloadStorageRow';
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
  const isVsphereOffload =
    sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere && isCopyOffloadEnabled;

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
              <OffloadStorageRow
                index={index}
                sourceProvider={sourceProvider}
                sourceStorages={sourceStorages}
                targetStorages={targetStorages}
              />
            ),
          }),
        inputs: [
          <InventorySourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            sourceStorages={sourceStorages}
          />,
          isVsphereOffload ? (
            <TargetStorageWithSuggestion
              fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
              index={index}
              sourceStorages={sourceStorages}
              targetStorages={targetStorages}
              testId={`target-storage-${getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}`}
            />
          ) : (
            <TargetStorageField
              fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
              targetStorages={targetStorages}
              testId={`target-storage-${getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}`}
            />
          ),
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
