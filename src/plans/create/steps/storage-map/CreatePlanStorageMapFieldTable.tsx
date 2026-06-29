import type { FC } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import AccessModeField from 'src/storageMaps/components/AccessModeField';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import OffloadStorageRow from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageRow';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import TargetStorageWithSuggestion from 'src/storageMaps/components/TargetStorageWithSuggestion';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';
import { validatePlanStorageMaps } from './utils';

const getHeaders = (isIscsi?: boolean) =>
  isIscsi
    ? [
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage],
          width: 45 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.AccessMode],
          width: 45 as const,
        },
      ]
    : [
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.SourceStorage],
          width: 30 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage],
          width: 30 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.AccessMode],
          width: 30 as const,
        },
      ];

type CreatePlanStorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  sourceStorageInventory?: InventoryStorage[];
  isLoading: boolean;
  loadError: Error | null;
  isIscsi?: boolean;
};

const CreatePlanStorageMapFieldTable: FC<CreatePlanStorageMapFieldTableProps> = ({
  isIscsi,
  isLoading,
  loadError,
  otherSourceStorages,
  sourceStorageInventory,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const { control } = useCreatePlanFormContext();

  const [storageMappings, sourceProvider] = useWatch({
    control,
    name: [CreatePlanStorageMapFieldId.StorageMap, CreatePlanStorageMapFieldId.SourceProvider],
  });

  const isOpenshift = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
  const isVsphereOffload =
    sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere && isCopyOffloadEnabled;

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: CreatePlanStorageMapFieldId.StorageMap,
    rules: {
      validate: (values) =>
        validatePlanStorageMaps(values, usedSourceStorages, isOpenshift, isIscsi),
    },
  });

  return (
    <FieldBuilderTable
      headers={getHeaders(isIscsi)}
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        ...(sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere &&
          isCopyOffloadEnabled && {
            additionalOptions: (
              <OffloadStorageRow
                index={index}
                sourceProvider={sourceProvider}
                sourceStorages={sourceStorageInventory ?? []}
                targetStorages={targetStorages}
              />
            ),
          }),
        inputs: isIscsi
          ? [
              <TargetStorageField
                fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                key={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                targetStorages={targetStorages}
                testId="target-storage-select"
              />,
              <AccessModeField
                fieldId={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
                key={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
                targetStorages={targetStorages}
                targetStorageFieldId={getStorageMapFieldId(
                  CreatePlanStorageMapFieldId.TargetStorage,
                  index,
                )}
              />,
            ]
          : [
              <GroupedSourceStorageField
                fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
                key={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
                storageMappings={storageMappings}
                usedSourceStorages={usedSourceStorages}
                otherSourceStorages={otherSourceStorages}
              />,
              isVsphereOffload ? (
                <TargetStorageWithSuggestion
                  fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                  key={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                  index={index}
                  sourceStorages={sourceStorageInventory ?? []}
                  targetStorages={targetStorages}
                  testId="target-storage-select"
                />
              ) : (
                <TargetStorageField
                  fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                  key={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
                  targetStorages={targetStorages}
                  testId="target-storage-select"
                />
              ),
              <AccessModeField
                fieldId={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
                key={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
                targetStorages={targetStorages}
                targetStorageFieldId={getStorageMapFieldId(
                  CreatePlanStorageMapFieldId.TargetStorage,
                  index,
                )}
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
        onClick: () => {
          append({
            [CreatePlanStorageMapFieldId.SourceStorage]:
              defaultStorageMapping[CreatePlanStorageMapFieldId.SourceStorage],
            [CreatePlanStorageMapFieldId.TargetStorage]: {
              name:
                targetStorages[0]?.name ??
                defaultStorageMapping[CreatePlanStorageMapFieldId.TargetStorage].name,
            },
            [StorageMapFieldId.AccessMode]: defaultStorageMapping[StorageMapFieldId.AccessMode],
          });
        },
      }}
      removeButton={{
        isDisabled: () => Boolean(isIscsi) || storageMappingFields.length <= 1,
        onClick: (index) => {
          if (storageMappingFields.length > 1) {
            remove(index);
          }
        },
      }}
    />
  );
};

export default CreatePlanStorageMapFieldTable;
