import type { ReactElement } from 'react';
import GroupedSourceStorageField from 'src/storageMaps/components/GroupedSourceStorageField';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import TargetStorageWithSuggestion from 'src/storageMaps/components/TargetStorageWithSuggestion';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import type { InventoryStorage } from '@utils/hooks/useStorages';
import type { TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { CreatePlanStorageMapFieldId } from './constants';

type GetCreatePlanStorageMapInputsArgs = {
  index: number;
  isVsphereOffload: boolean;
  otherSourceStorages: MappingValue[];
  sourceStorageInventory?: InventoryStorage[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
};

export const getCreatePlanStorageMapInputs = ({
  index,
  isVsphereOffload,
  otherSourceStorages,
  sourceStorageInventory,
  targetStorages,
  usedSourceStorages,
}: GetCreatePlanStorageMapInputsArgs): ReactElement[] => [
  <GroupedSourceStorageField
    fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
    key={getStorageMapFieldId(CreatePlanStorageMapFieldId.SourceStorage, index)}
    otherSourceStorages={otherSourceStorages}
    usedSourceStorages={usedSourceStorages}
  />,
  isVsphereOffload ? (
    <TargetStorageWithSuggestion
      fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
      index={index}
      key={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
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
];

export const getCreatePlanStorageMapIscsiInputs = (
  index: number,
  targetStorages: TargetStorage[],
): ReactElement[] => [
  <TargetStorageField
    fieldId={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
    key={getStorageMapFieldId(CreatePlanStorageMapFieldId.TargetStorage, index)}
    targetStorages={targetStorages}
    testId="target-storage-select"
  />,
];
