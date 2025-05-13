import { type FC, useCallback } from 'react';
import { type FieldPath, useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import type { CreatePlanFormData, MappingValue } from '../../types';

import {
  defaultStorageMapping,
  StorageMapFieldId,
  storageMapFieldLabels,
  type StorageMapping,
  type TargetStorage,
} from './constants';
import SourceStorageField from './SourceStorageField';
import TargetStorageField from './TargetStorageField';
import { getStorageMapFieldId } from './utils';

type StorageMapFieldTableProps = {
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
  isLoading: boolean;
  loadError: Error | null;
};

const StorageMapFieldTable: FC<StorageMapFieldTableProps> = ({
  isLoading,
  loadError,
  otherSourceStorages,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();

  const validate = useCallback(
    (values: StorageMapping[]) => {
      if (
        !usedSourceStorages.every((usedStorage) =>
          values.find((value) => value[StorageMapFieldId.SourceStorage].name === usedStorage.name),
        )
      ) {
        return t('All storages detected on the selected VMs require a mapping.');
      }

      return true;
    },
    [t, usedSourceStorages],
  );

  const {
    append,
    fields: netMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate,
    },
  });

  return (
    <FieldBuilderTable
      headers={[
        { label: storageMapFieldLabels[StorageMapFieldId.SourceStorage], width: 45 },
        { label: storageMapFieldLabels[StorageMapFieldId.TargetStorage], width: 45 },
      ]}
      fieldRows={netMappingFields.map((field, index) => ({
        ...field,
        inputs: [
          <SourceStorageField
            fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
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
          [...usedSourceStorages, ...otherSourceStorages].length === netMappingFields.length ||
          isLoading ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append({
            [StorageMapFieldId.SourceStorage]:
              defaultStorageMapping[StorageMapFieldId.SourceStorage],
            [StorageMapFieldId.TargetStorage]: { name: targetStorages[0].name },
          });
        },
      }}
      onRemove={(index) => {
        if (netMappingFields.length > 1) {
          remove(index);
          return;
        }

        setValue<FieldPath<CreatePlanFormData>>(
          getStorageMapFieldId(StorageMapFieldId.SourceStorage, index),
          defaultStorageMapping[StorageMapFieldId.SourceStorage],
        );
        setValue<FieldPath<CreatePlanFormData>>(
          getStorageMapFieldId(StorageMapFieldId.TargetStorage, index),
          { name: targetStorages[0].name },
        );
      }}
    />
  );
};

export default StorageMapFieldTable;
