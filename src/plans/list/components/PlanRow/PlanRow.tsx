import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';

import type { V1beta1Plan } from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import type { PlanTableResourceId } from '../../utils/constants';

import { usePlanListRowFields } from './hooks/usePlanListRowFields';

const PlanRow: FC<RowProps<V1beta1Plan>> = ({ resourceData: plan, resourceFields }) => {
  const rowFields = usePlanListRowFields(plan);
  return (
    <ModalHOC>
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
    </ModalHOC>
  );
};

export default PlanRow;
