import { createPlanStorageMapFieldLabels } from 'src/plans/create/steps/storage-map/constants';

import { StorageMapFieldId } from '@utils/storage/types';

export const getStorageMapHeaders = (
  isIscsi?: boolean,
): { label: string | undefined; width: 45 | 90 }[] =>
  isIscsi
    ? [
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 90 as const,
        },
      ]
    : [
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.SourceStorage],
          width: 45 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[StorageMapFieldId.TargetStorage],
          width: 45 as const,
        },
      ];
