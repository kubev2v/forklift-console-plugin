import { createElement } from 'react';
import DatesComparedHelperText from 'src/modules/Plans/components/DatesComparedHelperText/DatesComparedHelperText';
import { migrationTypes } from 'src/modules/Plans/utils/constants/migrationTypes';
import { planPhases } from 'src/modules/Plans/utils/constants/planPhases';
import { getMigrationType } from 'src/modules/Plans/utils/helpers/getMigrationType';
import { getPlanPhase } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import type { PlanData } from 'src/modules/Plans/utils/types/PlanData';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Plan } from '@kubev2v/types';
import { t } from '@utils/i18n';

import { planResourceApiJsonPaths, PlanTableResourceId } from './constants';

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
      placeholderLabel: t('Filter by namespace'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Namespace],
    label: t('Namespace'),
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
    label: t('Target provider'),
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
    jsonPath: (plan) => getPlanPhase({ plan } as PlanData),
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
    jsonPath: (plan) => getMigrationType({ plan } as PlanData),
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
      defaultValues: ['false'],
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
