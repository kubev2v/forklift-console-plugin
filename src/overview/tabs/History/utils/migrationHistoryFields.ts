import type { TFunction } from 'i18next';

import {
  COMPACT_COLUMN_WIDTH,
  MEDIUM_COLUMN_WIDTH,
  REGULAR_COLUMN_WIDTH,
} from '@components/common/TableView/columnWidthConstants';
import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Migration } from '@forklift-ui/types';
import { getMigrationResourcePerformance } from '@utils/migrations/migrationPerformance';
import type { MigrationPerformance } from '@utils/migrations/migrationPerformanceTypes';

import { getMigrationStatusFromVMs } from './migrationStatus';

const performance = (data: unknown): MigrationPerformance =>
  getMigrationResourcePerformance(data as V1beta1Migration);

export const getMigrationHistoryFields = (t: TFunction): ResourceField[] => [
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Filter by migration'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: '$.metadata.name',
    label: t('Migration'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by status'),
      type: FilterDefType.Enum,
      values: [
        { id: 'Running', label: t('Running') },
        { id: 'Succeeded', label: t('Succeeded') },
        { id: 'Partial', label: t('Partially migrated') },
        { id: 'Failed', label: t('Failed') },
        { id: 'Canceled', label: t('Canceled') },
      ],
    },
    isVisible: true,
    jsonPath: getMigrationStatusFromVMs,
    label: t('Status'),
    resourceFieldId: 'vms',
    sortable: true,
  },
  {
    defaultWidth: REGULAR_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Filter by plan'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: '$.spec.plan.name',
    label: t('Plan'),
    resourceFieldId: 'plan',
    sortable: true,
  },
  {
    defaultSortDirection: 'desc',
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.status.started',
    label: t('Started at'),
    resourceFieldId: 'started',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.status.completed',
    label: t('Completed at'),
    resourceFieldId: 'completed',
    sortable: true,
  },
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: (data: unknown): number | undefined => performance(data).durationSeconds,
    label: t('Duration'),
    resourceFieldId: 'duration',
    sortable: true,
  },
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: (data: unknown): number => performance(data).copiedBytes,
    label: t('Data transferred'),
    resourceFieldId: 'dataTransferred',
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    isVisible: true,
    jsonPath: (data: unknown): number | undefined => performance(data).avgTransferRate,
    label: t('Average rate'),
    resourceFieldId: 'averageRate',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: 'YYYY-MM-DD',
      type: FilterDefType.DateRange,
    },
    isVisible: false,
    jsonPath: (resourceData: unknown): { completed?: string; started?: string } => {
      const migration = resourceData as V1beta1Migration;
      return {
        completed: migration?.status?.completed,
        started: migration?.status?.started,
      };
    },
    label: t('Date range'),
    resourceFieldId: 'range',
  },
  {
    filter: {
      placeholderLabel: t('Group by plan'),
      standalone: true,
      type: FilterDefType.Slider,
    },
    isVisible: false,
    jsonPath: (
      migration: Record<string, string | boolean | object | ((resourceData: unknown) => unknown)>,
    ) => migration,
    label: t('Group by plan'),
    resourceFieldId: 'recent',
  },
];
