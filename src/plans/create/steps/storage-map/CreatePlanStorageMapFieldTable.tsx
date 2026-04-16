import type { FC } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import OffloadStorageRow from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageRow';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import TargetStorageWithSuggestion from 'src/storageMaps/components/TargetStorageWithSuggestion';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import type { TargetStorage } from 'src/storageMaps/utils/types';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue } from '../../types';

import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';
import { validatePlanStorageMaps } from './utils';

type CreatePlanStorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  sourceStorageInventory?: InventoryStorage[];
  isLoading: boolean;
  loadError: Error | null;
};

const CreatePlanStorageMapFieldTable: FC<CreatePlanStorageMapFieldTableProps> = ({
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
      validate: (values) => validatePlanStorageMaps(values, usedSourceStorages, isOpenshift),
    },
  });

  return (
    <FieldBuilderTable
      headers={[
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.SourceStorage],
          width: 45,
        },
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage],
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
                sourceStorages={sourceStorageInventory ?? []}
                targetStorages={targetStorages}
              />
            ),
          }),
        inputs: [
          <GroupedSourceStorageField
            fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMappings}
            usedSourceStorages={usedSourceStorages}
            otherSourceStorages={otherSourceStorages}
          />,
          isVsphereOffload ? (
            <TargetStorageWithSuggestion
              fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
              index={index}
              sourceStorages={sourceStorageInventory ?? []}
              targetStorages={targetStorages}
              testId="target-storage-select"
            />
          ) : (
            <TargetStorageField
              fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
              targetStorages={targetStorages}
              testId="target-storage-select"
            />
          ),
        ],
      }))}
      addButton={{
        isDisabled:
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
          });
        },
      }}
      removeButton={{
        isDisabled: () => storageMappingFields.length <= 1,
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
