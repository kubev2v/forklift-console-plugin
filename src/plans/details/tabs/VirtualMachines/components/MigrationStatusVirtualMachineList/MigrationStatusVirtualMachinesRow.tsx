import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
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
    <ModalHOC>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as MigrationStatusVirtualMachinesTableResourceId]}
        </VisibleTableData>
      ))}
    </ModalHOC>
  );
};

export default MigrationStatusVirtualMachinesRow;
