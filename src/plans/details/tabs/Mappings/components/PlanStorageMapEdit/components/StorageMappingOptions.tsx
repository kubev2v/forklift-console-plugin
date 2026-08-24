import type { FC } from 'react';
import AccessModeField from 'src/storageMaps/components/AccessModeField';
import OffloadStorageRow from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageRow';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import type { V1beta1Provider } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';

type StorageMappingOptionsProps = {
  index: number;
  isVsphereOffload: boolean;
  sourceProvider: V1beta1Provider;
  sourceStorages: InventoryStorage[];
  targetStorages: TargetStorage[];
};

const StorageMappingOptions: FC<StorageMappingOptionsProps> = ({
  index,
  isVsphereOffload,
  sourceProvider,
  sourceStorages,
  targetStorages,
}) => (
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
          sourceStorages={sourceStorages}
          targetStorages={targetStorages}
        />
      </StackItem>
    )}
  </Stack>
);

export default StorageMappingOptions;
