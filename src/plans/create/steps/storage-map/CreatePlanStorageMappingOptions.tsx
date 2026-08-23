import type { FC } from 'react';
import AccessModeField from 'src/storageMaps/components/AccessModeField';
import OffloadStorageRow from 'src/storageMaps/components/OffloadStorageIndexedForm/OffloadStorageRow';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import type { V1beta1Provider } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';

import { CreatePlanStorageMapFieldId } from './constants';

type CreatePlanStorageMappingOptionsProps = {
  index: number;
  isVsphereOffload: boolean;
  sourceProvider?: V1beta1Provider;
  sourceStorageInventory?: InventoryStorage[];
  targetStorages: TargetStorage[];
};

const CreatePlanStorageMappingOptions: FC<CreatePlanStorageMappingOptionsProps> = ({
  index,
  isVsphereOffload,
  sourceProvider,
  sourceStorageInventory,
  targetStorages,
}) => (
  <Stack hasGutter>
    <StackItem>
      <AccessModeField
        fieldId={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
        key={getStorageMapFieldId(StorageMapFieldId.AccessMode, index)}
        targetStorageFieldId={getStorageMapFieldId(
          CreatePlanStorageMapFieldId.TargetStorage,
          index,
        )}
        targetStorages={targetStorages}
      />
    </StackItem>
    {isVsphereOffload && sourceProvider && (
      <StackItem>
        <OffloadStorageRow
          index={index}
          sourceProvider={sourceProvider}
          sourceStorages={sourceStorageInventory ?? []}
          targetStorages={targetStorages}
        />
      </StackItem>
    )}
  </Stack>
);

export default CreatePlanStorageMappingOptions;
