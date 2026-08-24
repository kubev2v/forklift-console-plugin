import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import {
  PLAN_FIELD_WIDTH_PERCENTAGE,
  planResourceApiJsonPaths,
  PlanTableResourceId,
} from './constants';

export const planIdentityFields: ResourceField[] = [
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
    width: PLAN_FIELD_WIDTH_PERCENTAGE,
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
    width: PLAN_FIELD_WIDTH_PERCENTAGE,
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
    width: PLAN_FIELD_WIDTH_PERCENTAGE,
  },
  {
    filter: {
      placeholderLabel: t('Filter by target'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Destination],
    label: t('Target project'),
    resourceFieldId: PlanTableResourceId.Destination,
    sortable: true,
    width: PLAN_FIELD_WIDTH_PERCENTAGE,
  },
  {
    isVisible: true,
    jsonPath: (plan: unknown) => (plan as V1beta1Plan)?.spec?.vms?.length ?? 0,
    label: t('Virtual machines'),
    resourceFieldId: PlanTableResourceId.Vms,
    sortable: true,
  },
];
