import { createElement } from 'react';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import DatesComparedHelperText from 'src/plans/details/components/DatesComparedHelperText';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Plan } from '@kubev2v/types';
import { t } from '@utils/i18n';

import { planResourceApiJsonPaths, PlanTableResourceId } from './constants';

const planPhases: { id: PlanStatuses; label: string }[] = [
  { id: PlanStatuses.Archived, label: t('Archived') },
  { id: PlanStatuses.Canceled, label: t('Canceled') },
  { id: PlanStatuses.CannotStart, label: t('Cannot start') },
  { id: PlanStatuses.Completed, label: t('Complete') },
  { id: PlanStatuses.Executing, label: t('Running') },
  { id: PlanStatuses.Incomplete, label: t('Incomplete') },
  { id: PlanStatuses.Paused, label: t('Paused') },
  { id: PlanStatuses.Ready, label: t('Ready to start') },
];

const migrationTypes: { id: MigrationTypeValue; label: string }[] = [
  { id: MigrationTypeValue.Warm, label: t('Warm') },
  { id: MigrationTypeValue.Cold, label: t('Cold') },
  { id: MigrationTypeValue.Live, label: t('Live') },
];

export const planFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Name],
    label: t('Name'),
    resourceFieldId: PlanTableResourceId.Name,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by project'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Namespace],
    label: t('Project'),
    resourceFieldId: PlanTableResourceId.Namespace,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by source'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Source],
    label: t('Source provider'),
    resourceFieldId: PlanTableResourceId.Source,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by target'),
      type: FilterDefType.FreeText,
    },
    isVisible: false,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Destination],
    label: t('Target project'),
    resourceFieldId: PlanTableResourceId.Destination,
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: (plan) => (plan as V1beta1Plan)?.spec?.vms?.length ?? 0,
    label: t('Virtual machines'),
    resourceFieldId: PlanTableResourceId.Vms,
    sortable: true,
  },
  {
    filter: {
      groups: [
        {
          groupId: PlanTableResourceId.MigrationType,
          label: t('Migration type'),
        },
        { groupId: PlanTableResourceId.Phase, label: t('Migration status') },
      ],
      placeholderLabel: t('Filter'),
      primary: true,
      showFilterIcon: true,
      type: FilterDefType.GroupedEnum,
      values: [
        ...migrationTypes.map((migrationType) => ({
          ...migrationType,
          groupId: PlanTableResourceId.MigrationType,
          resourceFieldId: PlanTableResourceId.MigrationType,
        })),
        ...planPhases.map((planPhase) => ({
          ...planPhase,
          groupId: PlanTableResourceId.Phase,
          resourceFieldId: PlanTableResourceId.Phase,
        })),
      ],
    },
    label: null,
    resourceFieldId: null,
  },
  {
    filter: {
      isHidden: true,
      type: FilterDefType.Enum,
      values: planPhases,
    },
    isVisible: true,
    jsonPath: (plan) => getPlanStatus(plan as V1beta1Plan),
    label: t('Migration status'),
    resourceFieldId: PlanTableResourceId.Phase,
    sortable: true,
  },
  {
    filter: {
      isHidden: true,
      type: FilterDefType.Enum,
      values: migrationTypes,
    },
    isVisible: true,
    jsonPath: (plan) => getPlanMigrationType(plan as V1beta1Plan),
    label: t('Migration type'),
    resourceFieldId: PlanTableResourceId.MigrationType,
    sortable: true,
  },
  {
    filter: {
      helperText: createElement(DatesComparedHelperText),
      placeholderLabel: 'YYYY-MM-DD',
      type: FilterDefType.DateRange,
    },
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.MigrationStarted],
    label: t('Migration started'),
    resourceFieldId: PlanTableResourceId.MigrationStarted,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Description],
    label: t('Description'),
    resourceFieldId: PlanTableResourceId.Description,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: PlanTableResourceId.Actions,
    sortable: false,
  },
  {
    filter: {
      excludeFromClearFilters: true,
      placeholderLabel: t('Show archived'),
      standalone: true,
      type: FilterDefType.Slider,
    },
    isHidden: true,
    isPersistent: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Archived],
    label: t('Archived'),
    resourceFieldId: PlanTableResourceId.Archived,
  },
];
