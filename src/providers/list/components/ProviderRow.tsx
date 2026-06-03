import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import { Tr } from '@patternfly/react-table';
import type { ProviderData } from '@utils/providers/types';

import ProviderDataCell from './ProviderDataCell';

const ProviderRow: FC<RowProps<ProviderData>> = ({ resourceData, resourceFields }) => (
  <Tr>
    {resourceFields.map(({ resourceFieldId }) => (
      <ProviderDataCell
        key={resourceFieldId}
        resourceFieldId={resourceFieldId}
        resourceFields={resourceFields}
        resourceData={resourceData}
      />
    ))}
  </Tr>
);

export default ProviderRow;
