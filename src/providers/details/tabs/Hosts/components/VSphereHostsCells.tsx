import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { NameCellRenderer } from 'src/modules/Providers/views/details/tabs/Hosts/components/NameCellRenderer';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import type { HostCellProps, InventoryHostNetworkTriple } from './utils/types';
import IDCellRenderer from './IDCellRenderer';
import LinkSpeedCellRenderer from './LinkSpeedCellRenderer';
import MTUCellRenderer from './MTUCellRenderer';
import NetworkCellRenderer from './NetworkCellRenderer';

type RenderTdProps = {
  resourceData: InventoryHostNetworkTriple;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

const cellRenderers: Record<string, FC<HostCellProps>> = {
  id: IDCellRenderer,
  linkSpeed: LinkSpeedCellRenderer,
  mtu: MTUCellRenderer,
  name: NameCellRenderer,
  network: NetworkCellRenderer,
};

/**
 * Function to render a table cell (Td).
 * If the cell is an inventory cell (NETWORK_COUNT, STORAGE_COUNT, VM_COUNT, or HOST_COUNT)
 * and there's no inventory data, it won't render the cell.
 */
const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  if (!resourceFieldId) return <Td></Td>;

  const CellRenderer = cellRenderers?.[resourceFieldId] ?? (() => <></>);
  return (
    <Td key={resourceFieldId} dataLabel={resourceFieldId}>
      <CellRenderer data={resourceData} fieldId={resourceFieldId} fields={resourceFields} />
    </Td>
  );
};

const VSphereHostsCells: FC<RowProps<InventoryHostNetworkTriple>> = ({
  resourceData,
  resourceFields,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
  );
};

export default VSphereHostsCells;
