import { createElement } from 'react';
import DatesComparedHelperText from 'src/plans/details/components/DatesComparedHelperText';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

import { planResourceApiJsonPaths, PlanTableResourceId } from './constants';

export const planMetadataFields: ResourceField[] = [
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
    filter: {
      placeholderLabel: t('Filter by description'),
      type: FilterDefType.FreeText,
    },
    isVisible: false,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Description],
    label: t('Description'),
    resourceFieldId: PlanTableResourceId.Description,
    sortable: true,
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
