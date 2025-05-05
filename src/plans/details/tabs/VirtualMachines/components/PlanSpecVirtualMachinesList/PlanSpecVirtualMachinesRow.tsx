import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';

import { getSpecVirtualMachinesRowFields } from './utils/fields';
import type {
  PlanSpecVirtualMachinesTableResourceId,
  SpecVirtualMachinePageData,
} from './utils/types';

const PlanSpecVirtualMachinesRow: FC<RowProps<SpecVirtualMachinePageData>> = ({
  resourceData,
  resourceFields,
}) => {
  const rowFields = getSpecVirtualMachinesRowFields(resourceData);

  return (
    <ModalHOC>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as PlanSpecVirtualMachinesTableResourceId]}
        </VisibleTableData>
      ))}
    </ModalHOC>
  );
};

export default PlanSpecVirtualMachinesRow;
