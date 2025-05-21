import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { Tr } from '@patternfly/react-table';

import ProviderDataCell from './ProviderDataCell';

const ProviderRow: FC<RowProps<ProviderData>> = ({ resourceData, resourceFields }) => (
  <ModalHOC>
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
  </ModalHOC>
);

export default ProviderRow;
