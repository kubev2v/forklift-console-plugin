import { type FC, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { createPlanStorageMapFieldLabels } from 'src/plans/create/steps/storage-map/constants';
import { validatePlanStorageMaps } from 'src/plans/create/steps/storage-map/utils';
import type { MappingValue } from 'src/plans/create/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import OffloadStorageIndexedForm from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { StorageMapFieldId, type TargetStorage } from 'src/storageMaps/utils/types';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@forklift-ui/types';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanStorageEditFormValues } from '../utils/types';

type PlanStorageMapFieldsTableProps = {
  sourceProvider: V1beta1Provider;
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  isLoading: boolean;
  loadError: Error | null;
};

const PlanStorageMapFieldsTable: FC<PlanStorageMapFieldsTableProps> = ({
  isLoading,
  loadError,
  otherSourceStorages,
  sourceProvider,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const isOpenshift = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  const { control, trigger, watch } = useFormContext<PlanStorageEditFormValues>();

  const [storageMappings] = watch([StorageMapFieldId.StorageMap]);

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validatePlanStorageMaps(values, usedSourceStorages, isOpenshift),
    },
  });

  useEffect(() => {
    setTimeout(async () => {
      await trigger();
    }, 0);
  }, [trigger]);

  return (
    <FieldBuilderTable
      headers={[
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.SourceStorage],
          width: 45,
        },
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.TargetStorage],
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
            key={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMappings}
            usedSourceStorages={usedSourceStorages}
            otherSourceStorages={otherSourceStorages}
          />,
          <TargetStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
            key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
            targetStorages={targetStorages}
            testId="target-storage-select"
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          [...usedSourceStorages, ...otherSourceStorages].length === storageMappingFields.length ||
          isLoading ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: async () => {
          const missingStorage = usedSourceStorages.find(
            (sourceStorage) =>
              !storageMappingFields.some(
                (storageMapping) => storageMapping.sourceStorage.id === sourceStorage.id,
              ),
          );

          append({
            [StorageMapFieldId.SourceStorage]:
              missingStorage ?? defaultStorageMapping[StorageMapFieldId.SourceStorage],
            [StorageMapFieldId.TargetStorage]: {
              name:
                targetStorages[0]?.name ??
                defaultStorageMapping[StorageMapFieldId.TargetStorage].name,
            },
          });

          await trigger();
        },
      }}
      removeButton={{
        isDisabled: (index) => {
          if (storageMappingFields.length <= 1) return true;
          return usedSourceStorages.some(
            (storage) =>
              storage.id === storageMappingFields[index][StorageMapFieldId.SourceStorage].id,
          );
        },
        onClick: (index) => {
          if (
            storageMappingFields.length > 1 &&
            !usedSourceStorages.some(
              (storage) =>
                storage.id === storageMappingFields[index][StorageMapFieldId.SourceStorage].id,
            )
          ) {
            remove(index);
          }
        },
        tooltip: (index) => {
          if (storageMappingFields.length <= 1) {
            return t('At least one storage mapping must be provided.');
          }

          if (
            usedSourceStorages.some(
              (storage) =>
                storage.id === storageMappingFields[index][StorageMapFieldId.SourceStorage].id,
            )
          ) {
            return t('All storages detected on the selected VMs require a mapping.');
          }

          return undefined;
        },
      }}
    />
  );
};

export default PlanStorageMapFieldsTable;
