import { type FC, useMemo } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import { getPlanConcernsPanelFieldsData } from './utils/getPlanConcernsPanelFieldsData';
import type { MigrationPlanConcernsTableResourceId, PlanConcernsPanelData } from './utils/types';

const PlanConcernsRow: FC<RowProps<PlanConcernsPanelData>> = ({ resourceData, resourceFields }) => {
  const rowFields = useMemo(() => getPlanConcernsPanelFieldsData(resourceData), [resourceData]);

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId ?? ''}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as MigrationPlanConcernsTableResourceId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default PlanConcernsRow;
