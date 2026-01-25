import type { FC } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreatePlanStorageMapFieldId } from 'src/plans/create/steps/storage-map/constants';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@forklift-ui/types';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import OffloadStorageIndexedForm from '../../components/OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import SourceStorageField from '../../components/SourceStorageField';
import TargetStorageField from '../../components/TargetStorageField';
import { defaultStorageMapping, storageMapFieldLabels } from '../../utils/constants';
import { getStorageMapFieldId } from '../../utils/getStorageMapFieldId';
import { StorageMapFieldId, type StorageMappingValue, type TargetStorage } from '../../utils/types';
import type { UpdateMappingsFormData } from '../utils/types';
import { validateUpdatedStorageMaps } from '../utils/utils';

type UpdateStorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  sourceStorages: StorageMappingValue[];
  isLoading: boolean;
  loadError: Error | null;
  isVsphere: boolean;
  sourceProvider: V1beta1Provider | undefined;
};

const UpdateStorageMapFieldTable: FC<UpdateStorageMapFieldTableProps> = ({
  isLoading,
  isVsphere,
  loadError,
  sourceProvider,
  sourceStorages,
  targetStorages,
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
          <SourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMap}
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
          sourceStorages.length === storageMappingFields.length ||
          isLoading ||
          isSubmitting ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append({
            [CreatePlanStorageMapFieldId.SourceStorage]:
              defaultStorageMapping[CreatePlanStorageMapFieldId.SourceStorage],
            [CreatePlanStorageMapFieldId.TargetStorage]: {
              name:
                targetStorages[0]?.name ??
                defaultStorageMapping[CreatePlanStorageMapFieldId.TargetStorage].name,
            },
          });
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
