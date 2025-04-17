import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import type { ResourceField } from '@components/common/utils/types';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { ProviderActionsDropdown } from '../../actions/ProviderActionsDropdown';
import { TableEmptyCell } from '../../utils/components/TableCell/TableEmptyCell';

import type { CellProps } from './components/CellProps';
import { InventoryCellFactory } from './components/InventoryCellFactory';
import { NamespaceCell } from './components/NamespaceCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { StatusCell } from './components/StatusCell';
import { TypeCell } from './components/TypeCell';
import { URLCell } from './components/URLCell';
import { VirtualMachinesCell } from './components/VirtualMachinesCell';

/**
 * Function component to render a table row (Tr) for a provider with inventory.
 * Each cell (Td) in the row is rendered by the `renderTd` function.
 *
 * @param {RowProps<ProviderData>} props - The properties passed to the component.
 * @param {ResourceField[]} props.resourceFields - The fields to be displayed in the table row.
 * @param {ProviderData} props.resourceData - The data for the provider, including its inventory.
 *
 * @returns {ReactNode - A React table row (Tr) component.
 */
const ProviderRow: FC<RowProps<ProviderData>> = ({ resourceData, resourceFields }) => {
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </Tr>
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
  const hasInventory = resourceData?.inventory !== undefined;
  const inventoryCells = ['networkCount', 'storageCount', 'vmCount', 'hostCount'];

  // If the current cell is an inventory cell and there's no inventory data,
  // don't render the cell
  if (inventoryCells.includes(fieldId) && !hasInventory) {
    return <TableEmptyCell />;
  }

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

const cellRenderers: Record<string, FC<CellProps>> = {
  actions: (props) => <ProviderActionsDropdown isKebab {...props} />,
  hostCount: InventoryCellFactory({ icon: <OutlinedHddIcon /> }),
  name: ProviderLinkCell,
  namespace: NamespaceCell,
  networkCount: InventoryCellFactory({ icon: <NetworkIcon /> }),
  phase: StatusCell,
  storageCount: InventoryCellFactory({ icon: <DatabaseIcon /> }),
  type: TypeCell,
  url: URLCell,
  vmCount: VirtualMachinesCell,
};

type RenderTdProps = {
  resourceData: ProviderData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export default ProviderRow;
