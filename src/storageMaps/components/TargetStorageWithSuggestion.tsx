import { type FC, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import type { InventoryStorage } from '@utils/hooks/useStorages';

import { StorageMapFieldId, type StorageMappingValue, type TargetStorage } from '../utils/types';
import { resolveProductFromDatastoreName } from '../utils/vendorLookupTables';

import TargetStorageField from './TargetStorageField';

type TargetStorageWithSuggestionProps = {
  fieldId: string;
  index: number;
  sourceStorages: InventoryStorage[];
  targetStorages: TargetStorage[];
  testId?: string;
};

/**
 * Wraps TargetStorageField with vendor suggestion derived from the
 * selected source datastore name. Uses a lightweight name-based
 * heuristic (no inventory fetch) to avoid duplicate API calls.
 */
const TargetStorageWithSuggestion: FC<TargetStorageWithSuggestionProps> = ({
  fieldId,
  index,
  sourceStorages,
  targetStorages,
  testId,
}) => {
  const { control } = useFormContext();

  const sourceFieldId = getStorageMapFieldId(StorageMapFieldId.SourceStorage, index);
  const sourceValue = useWatch({ control, name: sourceFieldId }) as StorageMappingValue | undefined;

  const matchedDatastore = sourceStorages.find(
    (ds) => ds.id === sourceValue?.id || ds.name === sourceValue?.name,
  );

  const datastoreVendor = useMemo(
    () => resolveProductFromDatastoreName(matchedDatastore?.name),
    [matchedDatastore?.name],
  );

  return (
    <TargetStorageField
      fieldId={fieldId}
      targetStorages={targetStorages}
      testId={testId}
      suggestedVendorProduct={datastoreVendor}
    />
  );
};

export default TargetStorageWithSuggestion;
