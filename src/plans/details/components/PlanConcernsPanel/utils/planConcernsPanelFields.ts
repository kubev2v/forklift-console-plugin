import type { ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

export const planConcernsPanelFields: ResourceField[] = [
  {
    isVisible: true,
    jsonPath: '$.criticalCondition.severity',
    label: t('Severity'),
    resourceFieldId: 'severity',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.criticalCondition.message',
    label: t('Type'),
    resourceFieldId: 'type',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.criticalCondition.vmsNum',
    label: t('Impacted resources'),
    resourceFieldId: 'resource',
    sortable: true,
  },
];
