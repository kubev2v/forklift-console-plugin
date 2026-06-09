import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import type {
  PlanSpecVirtualMachinesTableResourceId,
  SpecVirtualMachinePageData,
} from '@utils/types/specVirtualMachinePageData';

import { getSpecVirtualMachinesRowFields } from './utils/fields';

const PlanSpecVirtualMachinesRow: FC<RowProps<SpecVirtualMachinePageData>> = ({
  resourceData,
  resourceFields,
}) => {
  const rowFields = getSpecVirtualMachinesRowFields(resourceData);

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as PlanSpecVirtualMachinesTableResourceId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default PlanSpecVirtualMachinesRow;
