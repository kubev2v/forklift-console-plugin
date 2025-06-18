import type { FC } from 'react';
import { type FieldPath, useFieldArray, useWatch } from 'react-hook-form';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import { defaultStorageMapping } from 'src/storageMaps/constants';
import type { TargetStorage } from 'src/storageMaps/types';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { CreatePlanFormData, MappingValue } from '../../types';

import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';
import { validatePlanStorageMaps } from './utils';

type CreatePlanStorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  isLoading: boolean;
  loadError: Error | null;
};

const CreatePlanStorageMapFieldTable: FC<CreatePlanStorageMapFieldTableProps> = ({
  isLoading,
  loadError,
  otherSourceStorages,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();
  const storageMappings = useWatch({ control, name: CreatePlanStorageMapFieldId.StorageMap });

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: CreatePlanStorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validatePlanStorageMaps(values, usedSourceStorages),
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
        inputs: [
          <GroupedSourceStorageField
            fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
            storageMappings={storageMappings}
            usedSourceStorages={usedSourceStorages}
            otherSourceStorages={otherSourceStorages}
          />,
          <TargetStorageField
            fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
            targetStorages={targetStorages}
          />,
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
        onClick: (index) => {
          if (storageMappingFields.length > 1) {
            remove(index);
            return;
          }

          setValue<FieldPath<CreatePlanFormData>>(
            getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index),
            defaultStorageMapping[CreatePlanStorageMapFieldId.SourceStorage],
          );
          setValue<FieldPath<CreatePlanFormData>>(
            getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index),
            {
              name:
                targetStorages[0]?.name ??
                defaultStorageMapping[CreatePlanStorageMapFieldId.TargetStorage].name,
            },
          );
        },
      }}
    />
  );
};

export default CreatePlanStorageMapFieldTable;
