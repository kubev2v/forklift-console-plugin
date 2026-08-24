import type { FC } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { CreatePlanStorageMapFieldId } from './constants';
import { getCreatePlanStorageMapHeaders } from './createPlanStorageMapHeaders';
import {
  getCreatePlanStorageMapInputs,
  getCreatePlanStorageMapIscsiInputs,
} from './createPlanStorageMapInputs';
import CreatePlanStorageMappingOptions from './CreatePlanStorageMappingOptions';
import { getCreatePlanStorageMapRemoveButton } from './getCreatePlanStorageMapRemoveButton';
import { validatePlanStorageMaps } from './utils';

type CreatePlanStorageMapFieldTableProps = {
  isIscsi?: boolean;
  isLoading: boolean;
  loadError: Error | null;
  otherSourceStorages: MappingValue[];
  sourceStorageInventory?: InventoryStorage[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
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

  const [sourceProvider, storageMappings] = useWatch({
    control,
    name: [CreatePlanStorageMapFieldId.SourceProvider, CreatePlanStorageMapFieldId.StorageMap],
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
      addButton={{
        isDisabled: Boolean(isIscsi) || isLoading || Boolean(loadError),
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
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        additionalOptions: (
          <CreatePlanStorageMappingOptions
            index={index}
            isVsphereOffload={isVsphereOffload}
            sourceProvider={sourceProvider}
            sourceStorageInventory={sourceStorageInventory}
            targetStorages={targetStorages}
          />
        ),
        inputs: isIscsi
          ? getCreatePlanStorageMapIscsiInputs(index, targetStorages)
          : getCreatePlanStorageMapInputs({
              index,
              isVsphereOffload,
              otherSourceStorages,
              sourceStorageInventory,
              targetStorages,
              usedSourceStorages,
            }),
      }))}
      headers={getCreatePlanStorageMapHeaders(isIscsi)}
      removeButton={getCreatePlanStorageMapRemoveButton({
        isIscsi,
        remove,
        storageMappingFieldsLength: storageMappingFields.length,
        storageMappings,
        t,
        usedSourceStorages,
      })}
    />
  );
};

export default CreatePlanStorageMapFieldTable;
