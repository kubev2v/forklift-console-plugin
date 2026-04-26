import type { FC } from 'react';
import TargetStorageField from 'src/storageMaps/components/TargetStorageField';
import TargetStorageWithSuggestion from 'src/storageMaps/components/TargetStorageWithSuggestion';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { StorageMapFieldId, type TargetStorage } from 'src/storageMaps/utils/types';

import type { InventoryStorage } from '@utils/hooks/useStorages';

type TargetStorageInputFieldProps = {
  index: number;
  isVsphereOffload: boolean;
  sourceStorages: InventoryStorage[];
  targetStorages: TargetStorage[];
};

const TargetStorageInputField: FC<TargetStorageInputFieldProps> = ({
  index,
  isVsphereOffload,
  sourceStorages,
  targetStorages,
}) => {
  const fieldId = getStorageMapFieldId(StorageMapFieldId.TargetStorage, index);
  const testId = `target-storage-${fieldId}`;

  return isVsphereOffload ? (
    <TargetStorageWithSuggestion
      fieldId={fieldId}
      index={index}
      sourceStorages={sourceStorages}
      targetStorages={targetStorages}
      testId={testId}
    />
  ) : (
    <TargetStorageField fieldId={fieldId} targetStorages={targetStorages} testId={testId} />
  );
};

export default TargetStorageInputField;
