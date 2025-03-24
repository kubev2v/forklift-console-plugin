import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';

import { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import { NameCellRenderer } from './components/NameCellRenderer';
import { InventoryHostPair } from './utils/helpers';
import {
  HostCellProps,
  IDCellRenderer,
  LinkSpeedCellRenderer,
  MTUCellRenderer,
  NetworkCellRenderer,
} from './components';

export const VSphereHostsCells: React.FC<RowProps<InventoryHostPair>> = ({
  resourceFields,
  resourceData,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
  );
};

/**
 * Function to render a table cell (Td).
 * If the cell is an inventory cell (NETWORK_COUNT, STORAGE_COUNT, VM_COUNT, or HOST_COUNT)
 * and there's no inventory data, it won't render the cell.
 *
 * @param {RenderTdProps} props - An object holding all the parameters.
 * @param {ProviderData} props.resourceData - The data for the resource.
 * @param {string} props.resourceFieldId - The field ID for the resource.
 * @param {ResourceField[]} props.resourceFields - Array of resource fields
 *
 * @returns {ReactNode | undefined} - A React table cell (Td) component or undefined.
 */
const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

const cellRenderers: Record<string, React.FC<HostCellProps>> = {
  name: NameCellRenderer,
  id: IDCellRenderer,
  network: NetworkCellRenderer,
  linkSpeed: LinkSpeedCellRenderer,
  mtu: MTUCellRenderer,
};

interface RenderTdProps {
  resourceData: InventoryHostPair;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}
