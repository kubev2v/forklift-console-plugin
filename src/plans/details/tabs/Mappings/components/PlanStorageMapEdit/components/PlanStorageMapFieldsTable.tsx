import type { FC } from 'react';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { getStorageMapHeaders } from './planStorageMapHeaders';
import {
  getDefaultAppendMapping,
  getMissingUsedSourceStorage,
  getPlanStorageMapRemoveButton,
} from './planStorageMapRemoveButton';
import StorageMappingOptions from './StorageMappingOptions';
import TargetStorageInputField from './TargetStorageInputField';
import { usePlanStorageMapFieldsTable } from './usePlanStorageMapFieldsTable';

type PlanStorageMapFieldsTableProps = {
  isIscsi?: boolean;
  isLoading: boolean;
  loadError: Error | null;
  otherSourceStorages: MappingValue[];
  sourceProvider: V1beta1Provider;
  sourceStorages?: InventoryStorage[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
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

  const { fieldArray, isVsphereOffload, storageMappings, trigger } = usePlanStorageMapFieldsTable({
    isIscsi,
    sourceProvider,
    usedSourceStorages,
  });

  const { append, fields: storageMappingFields, remove } = fieldArray;

  return (
    <FieldBuilderTable
      addButton={{
        isDisabled: Boolean(isIscsi) || isLoading || Boolean(loadError),
        label: t('Add mapping'),
        onClick: async () => {
          const missingStorage = getMissingUsedSourceStorage(storageMappings, usedSourceStorages);

          append(getDefaultAppendMapping(missingStorage, targetStorages[0]?.name ?? ''));

          await trigger();
        },
      }}
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
                index={index}
                isVsphereOffload={false}
                key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
                sourceStorages={[]}
                targetStorages={targetStorages}
              />,
            ]
          : [
              <GroupedSourceStorageField
                fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
                key={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
                otherSourceStorages={otherSourceStorages}
                usedSourceStorages={usedSourceStorages}
              />,
              <TargetStorageInputField
                index={index}
                isVsphereOffload={isVsphereOffload}
                key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
                sourceStorages={sourceStorages ?? []}
                targetStorages={targetStorages}
              />,
            ],
      }))}
      headers={getStorageMapHeaders(isIscsi)}
      removeButton={getPlanStorageMapRemoveButton({
        isIscsi,
        remove,
        storageMappingFields,
        storageMappings,
        t,
        usedSourceStorages,
      })}
    />
  );
};

export default PlanStorageMapFieldsTable;
