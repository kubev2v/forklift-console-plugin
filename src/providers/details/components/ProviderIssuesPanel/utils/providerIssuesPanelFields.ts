import type { ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

export const providerIssuesPanelFields: ResourceField[] = [
  {
    isVisible: true,
    jsonPath: '$.condition.severity',
    label: t('Severity'),
    resourceFieldId: 'severity',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.condition.type',
    label: t('Type'),
    resourceFieldId: 'type',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.condition.message',
    label: t('Message'),
    resourceFieldId: 'message',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.condition.resource',
    label: t('Impacted resources'),
    resourceFieldId: 'resource',
    sortable: true,
  },
];
