import type { ReactElement } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import AccessModeField from '../../components/AccessModeField';
import OffloadStorageRow from '../../components/OffloadStorageIndexedForm/OffloadStorageRow';
import SourceStorageField from '../../components/SourceStorageField';
import TargetStorageField from '../../components/TargetStorageField';
import TargetStorageWithSuggestion from '../../components/TargetStorageWithSuggestion';
import { getStorageMapFieldId } from '../../utils/getStorageMapFieldId';

type StorageMapEditFieldRowOptions = {
  index: number;
  inventorySourceStorages: InventoryStorage[];
  isVsphereOffload: boolean;
  sourceProvider: V1beta1Provider | undefined;
  sourceStorages: MappingValue[];
  targetStorages: TargetStorage[];
};

export const getStorageMapEditFieldRowContent = ({
  index,
  inventorySourceStorages,
  isVsphereOffload,
  sourceProvider,
  sourceStorages,
  targetStorages,
}: StorageMapEditFieldRowOptions): {
  additionalOptions: ReactElement;
  inputs: ReactElement[];
} => ({
  additionalOptions: (
    <Stack hasGutter>
      <StackItem>
        <AccessModeField
          fieldId={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
          targetStorageFieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
          targetStorages={targetStorages}
        />
      </StackItem>
      {isVsphereOffload && (
        <StackItem>
          <OffloadStorageRow
            index={index}
            sourceProvider={sourceProvider}
            sourceStorages={inventorySourceStorages}
            targetStorages={targetStorages}
          />
        </StackItem>
      )}
    </Stack>
  ),
  inputs: [
    <SourceStorageField
      fieldId={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
      key={getStorageMapFieldId(StorageMapFieldId.SourceStorage, index)}
      sourceStorages={sourceStorages}
    />,
    isVsphereOffload ? (
      <TargetStorageWithSuggestion
        fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
        index={index}
        key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
        sourceStorages={inventorySourceStorages}
        targetStorages={targetStorages}
        testId={`target-storage-${getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}`}
      />
    ) : (
      <TargetStorageField
        fieldId={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
        key={getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}
        targetStorages={targetStorages}
        testId={`target-storage-${getStorageMapFieldId(StorageMapFieldId.TargetStorage, index)}`}
      />
    ),
  ],
});
