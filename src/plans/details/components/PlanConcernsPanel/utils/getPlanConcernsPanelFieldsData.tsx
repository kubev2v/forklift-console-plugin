import type { ReactElement } from 'react';

import ResourceTableCell from '../ResourceTableCell';
import SeverityTableCell from '../SeverityTableCell';
import TypeTableCell from '../TypeTableCell';

import { MigrationPlanConcernsTableResourceId, type PlanConcernsPanelData } from './types';

export const getPlanConcernsPanelFieldsData = (
  fieldsData: PlanConcernsPanelData,
): Record<MigrationPlanConcernsTableResourceId, ReactElement> => {
  return {
    [MigrationPlanConcernsTableResourceId.Resource]: <ResourceTableCell fieldsData={fieldsData} />,
    [MigrationPlanConcernsTableResourceId.Severity]: <SeverityTableCell fieldsData={fieldsData} />,
    [MigrationPlanConcernsTableResourceId.Type]: <TypeTableCell fieldsData={fieldsData} />,
  };
};
