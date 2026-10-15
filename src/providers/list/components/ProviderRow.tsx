import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import TableRow from '@components/common/DataViewTable/TableRow';
import type { ProviderData } from '@utils/providers/types';

import ProviderDataCell from './ProviderDataCell';

const ProviderRow: FC<RowProps<ProviderData>> = ({ resourceData, resourceFields }) => (
  <TableRow>
    {resourceFields.map(({ resourceFieldId }) => (
      <ProviderDataCell
        key={resourceFieldId}
        resourceData={resourceData}
        resourceFieldId={resourceFieldId}
        resourceFields={resourceFields}
      />
    ))}
  </TableRow>
);

export default ProviderRow;
