import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';

import { getMigrationStatusVirtualMachinesRowFields } from './utils/fields';
import type {
  MigrationStatusVirtualMachinePageData,
  MigrationStatusVirtualMachinesTableResourceId,
} from './utils/types';

const MigrationStatusVirtualMachinesRow: FC<RowProps<MigrationStatusVirtualMachinePageData>> = ({
  resourceData,
  resourceFields,
}) => {
  const rowFields = getMigrationStatusVirtualMachinesRowFields(resourceData);

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as MigrationStatusVirtualMachinesTableResourceId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default MigrationStatusVirtualMachinesRow;
