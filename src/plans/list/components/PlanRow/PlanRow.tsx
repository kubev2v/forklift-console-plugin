import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import type { V1beta1Plan } from '@forklift-ui/types';

import type { PlanTableResourceId } from '../../utils/constants';

import { usePlanListRowFields } from './hooks/usePlanListRowFields';

/**
 * Cell renderer for the plans list. The surrounding `<Tr>` is provided by
 * `StandardPageWithSelection` / `withTr` when checkboxes are injected.
 */
const PlanRow: FC<RowProps<V1beta1Plan>> = ({ resourceData: plan, resourceFields }) => {
  const rowFields = usePlanListRowFields(plan);
  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          fieldId={resourceFieldId ?? ''}
          key={resourceFieldId}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as PlanTableResourceId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default PlanRow;
