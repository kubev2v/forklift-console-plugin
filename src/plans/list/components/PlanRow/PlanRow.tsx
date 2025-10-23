import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';

import type { V1beta1Plan } from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import type { PlanTableResourceId } from '../../utils/constants';

import { usePlanListRowFields } from './hooks/usePlanListRowFields';

const PlanRow: FC<RowProps<V1beta1Plan>> = ({ resourceData: plan, resourceFields }) => {
  const rowFields = usePlanListRowFields(plan);
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as PlanTableResourceId]}
        </VisibleTableData>
      ))}
    </Tr>
  );
};

export default PlanRow;
