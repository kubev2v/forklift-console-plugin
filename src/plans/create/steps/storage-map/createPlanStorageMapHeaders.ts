import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';

export const getCreatePlanStorageMapHeaders = (
  isIscsi?: boolean,
): { label: string | undefined; width: 45 | 90 }[] =>
  isIscsi
    ? [
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage],
          width: 90 as const,
        },
      ]
    : [
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.SourceStorage],
          width: 45 as const,
        },
        {
          label: createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage],
          width: 45 as const,
        },
      ];
