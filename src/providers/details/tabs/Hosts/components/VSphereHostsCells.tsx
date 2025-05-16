import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import { RenderTd } from './utils/renderTd';
import type { InventoryHostNetworkTriple } from './utils/types';

const VSphereHostsCells: FC<RowProps<InventoryHostNetworkTriple>> = ({
  resourceData,
  resourceFields,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) => (
        <RenderTd
          resourceData={resourceData}
          resourceFieldId={resourceFieldId}
          resourceFields={resourceFields}
        />
      ))}
    </>
  );
};

export default VSphereHostsCells;
