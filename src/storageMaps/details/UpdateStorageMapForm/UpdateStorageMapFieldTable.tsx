import type { FC } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@kubev2v/types';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import GroupedSourceStorageField from '../../components/GroupedSourceStorageField';
import OffloadStorageIndexedForm from '../../components/OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import TargetStorageField from '../../components/TargetStorageField';
import { defaultStorageMapping, StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import type { StorageMappingValue, TargetStorage } from '../../types';
import { getStorageMapFieldId } from '../../utils/getStorageMapFieldId';
import type { UpdateMappingsFormData } from '../constants';
import { validateUpdatedStorageMaps } from '../utils';

type UpdateStorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  usedSourceStorages: StorageMappingValue[];
  otherSourceStorages: StorageMappingValue[];
  isLoading: boolean;
  loadError: Error | null;
  isVsphere: boolean;
  sourceProvider: V1beta1Provider | undefined;
};

const UpdateStorageMapFieldTable: FC<UpdateStorageMapFieldTableProps> = ({
  isLoading,
  isVsphere,
  loadError,
  otherSourceStorages,
  sourceProvider,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const {
    control,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useFormContext<UpdateMappingsFormData>();
  const { storageMap } = watch();

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validateUpdatedStorageMaps(values),
    },
  });

  return (
    <FieldBuilderTable
      headers={[
        {
          label: storageMapFieldLabels[StorageMapFieldId.SourceStorage],
          width: 45,
        },
        {
          label: storageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 45,
        },
      ]}
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        ...(isVsphere &&
          isCopyOffloadEnabled && {
            additionalOptions: (
              <OffloadStorageIndexedForm index={index} sourceProvider={sourceProvider} />
            ),
          }),
        inputs: [
          <GroupedSourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMap}
            usedSourceStorages={usedSourceStorages}
            otherSourceStorages={otherSourceStorages}
          />,
          <TargetStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
            targetStorages={targetStorages}
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          [...usedSourceStorages, ...otherSourceStorages].length === storageMappingFields.length ||
          isLoading ||
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

export default UpdateStorageMapFieldTable;
