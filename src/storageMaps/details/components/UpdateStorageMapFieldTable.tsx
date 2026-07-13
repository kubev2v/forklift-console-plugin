import type { FC } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreatePlanStorageMapFieldId } from 'src/plans/create/steps/storage-map/constants';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import {
  StorageMapFieldId,
  type StorageMappingValue,
  type TargetStorage,
} from '@utils/storage/types';

import AccessModeField from '../../components/AccessModeField';
import OffloadStorageRow from '../../components/OffloadStorageIndexedForm/OffloadStorageRow';
import SourceStorageField from '../../components/SourceStorageField';
import TargetStorageField from '../../components/TargetStorageField';
import TargetStorageWithSuggestion from '../../components/TargetStorageWithSuggestion';
import { defaultStorageMapping, storageMapFieldLabels } from '../../utils/constants';
import { getStorageMapFieldId } from '../../utils/getStorageMapFieldId';
import type { UpdateMappingsFormData } from '../utils/types';
import { validateUpdatedStorageMaps } from '../utils/utils';

type UpdateStorageMapFieldTableProps = {
  inventorySourceStorages: InventoryStorage[];
  isLoading: boolean;
  isVsphere: boolean;
  loadError: Error | null;
  sourceProvider: V1beta1Provider | undefined;
  sourceStorages: StorageMappingValue[];
  targetStorages: TargetStorage[];
};

const UpdateStorageMapFieldTable: FC<UpdateStorageMapFieldTableProps> = ({
  inventorySourceStorages,
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
  const isVsphereOffload = isVsphere && isCopyOffloadEnabled;
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
        additionalOptions: (
          <Stack hasGutter>
            <StackItem>
              <AccessModeField
                fieldId={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
                targetStorages={targetStorages}
                targetStorageFieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
              />
            </StackItem>
            {isVsphereOffload && (
              <StackItem>
                <OffloadStorageRow
                  index={index}
                  sourceProvider={sourceProvider}
                  sourceStorages={inventorySourceStorages}
                  targetStorages={targetStorages}
                />
              </StackItem>
            )}
          </Stack>
        ),
        inputs: [
          <SourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMap}
            sourceStorages={sourceStorages}
          />,
          isVsphereOffload ? (
            <TargetStorageWithSuggestion
              fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
              index={index}
              sourceStorages={inventorySourceStorages}
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
