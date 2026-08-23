import type { ReactElement } from 'react';

import { Label, Split, SplitItem } from '@patternfly/react-core';
import type { TargetStorage } from '@utils/storage/types';

export const shouldShowDefaultLabel = (storage: TargetStorage): boolean =>
  storage.isDefaultVirt || storage.isDefault;

export const renderStorageOption = (
  storage: TargetStorage,
  t: (key: string) => string,
): ReactElement => (
  <Split hasGutter>
    <SplitItem isFilled>{storage.name}</SplitItem>
    {shouldShowDefaultLabel(storage) && (
      <SplitItem>
        <Label color="green" isCompact>
          {t('Default')}
        </Label>
      </SplitItem>
    )}
    {storage.isNetAppShift && (
      <SplitItem>
        <Label color="blue" isCompact>
          {t('NetApp Shift')}
        </Label>
      </SplitItem>
    )}
  </Split>
);

export const partitionTargetStoragesByVendor = (
  targetStorages: TargetStorage[],
  suggestedVendorProduct: string | undefined,
  resolveProduct: (provisioner: string) => string | undefined,
): { others: TargetStorage[]; recommended: TargetStorage[] } => {
  if (!suggestedVendorProduct) {
    return { others: targetStorages, recommended: [] };
  }

  const recommended: TargetStorage[] = [];
  const others: TargetStorage[] = [];

  for (const storage of targetStorages) {
    const resolved = storage.provisioner ? resolveProduct(storage.provisioner) : undefined;

    if (resolved === suggestedVendorProduct) {
      recommended.push(storage);
    } else {
      others.push(storage);
    }
  }

  return { others, recommended };
};
