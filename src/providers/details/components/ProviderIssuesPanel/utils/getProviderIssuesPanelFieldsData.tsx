import type { ReactElement } from 'react';

import MessageTableCell from '../MessageTableCell';
import ResourceTableCell from '../ResourceTableCell';
import SeverityTableCell from '../SeverityTableCell';
import TypeTableCell from '../TypeTableCell';

import { type ProviderIssuesPanelData, ProviderIssuesTableResourceId } from './types';

export const getProviderIssuesPanelFieldsData = (
  fieldsData: ProviderIssuesPanelData,
): Record<ProviderIssuesTableResourceId, ReactElement> => ({
  [ProviderIssuesTableResourceId.Message]: <MessageTableCell fieldsData={fieldsData} />,
  [ProviderIssuesTableResourceId.Resource]: <ResourceTableCell fieldsData={fieldsData} />,
  [ProviderIssuesTableResourceId.Severity]: <SeverityTableCell fieldsData={fieldsData} />,
  [ProviderIssuesTableResourceId.Type]: <TypeTableCell fieldsData={fieldsData} />,
});
