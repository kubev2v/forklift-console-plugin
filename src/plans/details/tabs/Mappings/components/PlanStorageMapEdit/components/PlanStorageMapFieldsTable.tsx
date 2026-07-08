import { type FC, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { createPlanStorageMapFieldLabels } from 'src/plans/create/steps/storage-map/constants';
import { validatePlanStorageMaps } from 'src/plans/create/steps/storage-map/utils';
import AccessModeField from 'src/storageMaps/components/AccessModeField';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import OffloadStorageRow from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageRow';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import type { PlanStorageEditFormValues } from '../utils/types';

import TargetStorageInputField from './TargetStorageInputField';

const getStorageMapHeaders = (isIscsi?: boolean) =>
  isIscsi
    ? [
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 90 as const,
        },
      ]
    : [
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.SourceStorage],
          width: 45 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 45 as const,
        },
      ];

type StorageMappingOptionsProps = {
  index: number;
  isVsphereOffload: boolean;
  sourceProvider: V1beta1Provider;
  sourceStorages: InventoryStorage[];
  targetStorages: TargetStorage[];
};

const StorageMappingOptions: FC<StorageMappingOptionsProps> = ({
  index,
  isVsphereOffload,
  sourceProvider,
  sourceStorages,
  targetStorages,
}) => (
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
          sourceStorages={sourceStorages}
          targetStorages={targetStorages}
        />
      </StackItem>
    )}
  </Stack>
);

type PlanStorageMapFieldsTableProps = {
  sourceProvider: V1beta1Provider;
  sourceStorages?: InventoryStorage[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  isLoading: boolean;
  loadError: Error | null;
  isIscsi?: boolean;
};

const PlanStorageMapFieldsTable: FC<PlanStorageMapFieldsTableProps> = ({
  isIscsi,
  isLoading,
  loadError,
  otherSourceStorages,
  sourceProvider,
  sourceStorages,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const isOpenshift = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
  const isVsphereOffload =
    sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere && isCopyOffloadEnabled;

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
      validate: (values) =>
        validatePlanStorageMaps(values, usedSourceStorages, isOpenshift, isIscsi),
    },
  });

  useEffect(() => {
    setTimeout(async () => {
      await trigger();
    }, 0);
  }, [trigger]);

  return (
    <FieldBuilderTable
      headers={getStorageMapHeaders(isIscsi)}
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        additionalOptions: (
          <StorageMappingOptions
            index={index}
            isVsphereOffload={isVsphereOffload}
            sourceProvider={sourceProvider}
            sourceStorages={sourceStorages ?? []}
            targetStorages={targetStorages}
          />
        ),
        inputs: isIscsi
          ? [
              <TargetStorageInputField
                key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
                index={index}
                isVsphereOffload={false}
                sourceStorages={[]}
                targetStorages={targetStorages}
              />,
            ]
          : [
              <GroupedSourceStorageField
                fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
                key={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
                storageMappings={storageMappings}
                usedSourceStorages={usedSourceStorages}
                otherSourceStorages={otherSourceStorages}
              />,
              <TargetStorageInputField
                key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
                index={index}
                isVsphereOffload={isVsphereOffload}
                sourceStorages={sourceStorages ?? []}
                targetStorages={targetStorages}
              />,
            ],
      }))}
      addButton={{
        isDisabled:
          Boolean(isIscsi) ||
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
          if (Boolean(isIscsi) || storageMappingFields.length <= 1) return true;
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
