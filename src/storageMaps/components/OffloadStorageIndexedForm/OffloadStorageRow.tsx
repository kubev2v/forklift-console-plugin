import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import type { V1beta1Provider } from '@forklift-ui/types';
import type { InventoryStorage } from '@utils/hooks/useStorages';

import { useDatastoreVendor } from '../../hooks/useDatastoreVendor';
import { StorageMapFieldId, type StorageMappingValue, type TargetStorage } from '../../utils/types';
import type { DatastoreWithBacking } from '../../utils/vendorLookupTables';

import OffloadStorageIndexedForm from './OffloadStorageIndexedForm';

type OffloadStorageRowProps = {
  index: number;
  sourceProvider: V1beta1Provider | undefined;
  sourceStorages: InventoryStorage[];
  targetStorages: TargetStorage[];
};

/**
 * Reads per-row form values to resolve which source datastore and target
 * storage class are selected, resolves the datastore vendor once,
 * then passes all data to OffloadStorageIndexedForm.
 */
const OffloadStorageRow: FC<OffloadStorageRowProps> = ({
  index,
  sourceProvider,
  sourceStorages,
  targetStorages,
}) => {
  const { control } = useFormContext();

  const sourceFieldId = getStorageMapFieldId(StorageMapFieldId.SourceStorage, index);
  const targetFieldId = getStorageMapFieldId(StorageMapFieldId.TargetStorage, index);

  const [sourceValue, targetValue] = useWatch({
    control,
    name: [sourceFieldId, targetFieldId],
  });

  const sourceId = (sourceValue as StorageMappingValue | undefined)?.id;
  const sourceName = (sourceValue as StorageMappingValue | undefined)?.name;
  const targetName = (targetValue as StorageMappingValue | undefined)?.name;

  const matchedDatastore = sourceStorages.find(
    (ds) => ds.id === sourceId || ds.name === sourceName,
  );

  const matchedTarget = targetStorages.find((ts) => ts.name === targetName);

  const { datastoreVendor } = useDatastoreVendor(
    sourceProvider,
    matchedDatastore as DatastoreWithBacking | undefined,
  );

  return (
    <OffloadStorageIndexedForm
      index={index}
      sourceProvider={sourceProvider}
      datastoreVendor={datastoreVendor}
      targetProvisioner={matchedTarget?.provisioner}
    />
  );
};

export default OffloadStorageRow;
