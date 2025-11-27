import type { ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

export const planConcernsPanelFields: ResourceField[] = [
  {
    isVisible: true,
    jsonPath: '$.criticalConditionOrConcern.severity',
    label: t('Severity'),
    resourceFieldId: 'severity',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.criticalConditionOrConcern.message',
    label: t('Type'),
    resourceFieldId: 'type',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.criticalConditionOrConcern.vmsNum',
    label: t('Impacted resources'),
    resourceFieldId: 'resource',
    sortable: true,
  },
];
