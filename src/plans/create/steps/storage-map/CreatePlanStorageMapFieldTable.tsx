import type { FC } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import OffloadStorageIndexedForm from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import { defaultStorageMapping } from 'src/storageMaps/constants';
import type { TargetStorage } from 'src/storageMaps/types';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue } from '../../types';

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
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const { control } = useCreatePlanFormContext();

  const [storageMappings, sourceProvider] = useWatch({
    control,
    name: [CreatePlanStorageMapFieldId.StorageMap, CreatePlanStorageMapFieldId.SourceProvider],
  });

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
        ...(sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere &&
          isCopyOffloadEnabled && {
            additionalOptions: (
              <OffloadStorageIndexedForm index={index} sourceProvider={sourceProvider} />
            ),
          }),
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
        isDisabled: storageMappingFields.length <= 1,
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
