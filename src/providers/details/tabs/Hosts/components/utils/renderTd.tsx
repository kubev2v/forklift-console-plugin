import type { FC, ReactElement } from 'react';
import { NameCellRenderer } from 'src/providers/details/tabs/Hosts/components/NameCellRenderer';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';

import IDCellRenderer from '../IDCellRenderer';
import LinkSpeedCellRenderer from '../LinkSpeedCellRenderer';
import MTUCellRenderer from '../MTUCellRenderer';
import NetworkCellRenderer from '../NetworkCellRenderer';

import type { HostCellProps, InventoryHostNetworkTriple } from './types';

type RenderTdProps = {
  resourceData: InventoryHostNetworkTriple;
  resourceFieldId: string | null;
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
export const RenderTd = ({
  resourceData,
  resourceFieldId,
  resourceFields,
}: RenderTdProps): ReactElement => {
  if (!resourceFieldId) {
    return <ResizableTd columnId={null}></ResizableTd>;
  }

  const CellRenderer = cellRenderers?.[resourceFieldId] ?? null;

  return (
    <ResizableTd
      columnId={resourceFieldId}
      dataLabel={resourceFieldId}
      key={resourceFieldId}
      resourceFields={resourceFields}
    >
      <CellRenderer data={resourceData} fieldId={resourceFieldId} fields={resourceFields} />
    </ResizableTd>
  );
};
