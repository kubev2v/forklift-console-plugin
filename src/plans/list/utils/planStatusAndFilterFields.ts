import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import { PlanTableResourceId } from './constants';
import { migrationTypes, planPhases } from './planFieldFilterOptions';

export const planStatusAndFilterFields: ResourceField[] = [
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
      placeholderLabel: t('Filter by status'),
      type: FilterDefType.Enum,
      values: planPhases,
    },
    isVisible: true,
    jsonPath: (plan: unknown) => getPlanStatus(plan as V1beta1Plan),
    label: t('Migration status'),
    resourceFieldId: PlanTableResourceId.Phase,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by type'),
      type: FilterDefType.Enum,
      values: migrationTypes,
    },
    isVisible: true,
    jsonPath: (plan: unknown) => getPlanMigrationType(plan as V1beta1Plan),
    label: t('Migration type'),
    resourceFieldId: PlanTableResourceId.MigrationType,
    sortable: true,
  },
];
