import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { createStatusCell } from 'src/modules/utils/createStatusCell';

import type { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import { StorageMapActionsDropdown } from '../../actions/StorageMapActionsDropdown';
import type { StorageMapData } from '../../utils/types/StorageMapData';

import type { CellProps } from './components/CellProps';
import { ErrorStatusCell } from './components/ErrorStatusCell';
import { NamespaceCell } from './components/NamespaceCell';
import { PlanCell } from './components/PlanCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { StorageMapLinkCell } from './components/StorageMapLinkCell';

const cellRenderers: Record<string, FC<CellProps>> = {
  actions: (props) => <StorageMapActionsDropdown isKebab {...props} />,
  destination: ProviderLinkCell,
  name: StorageMapLinkCell,
  namespace: NamespaceCell,
  owner: PlanCell,
  phase: createStatusCell(ErrorStatusCell),
  source: ProviderLinkCell,
};

type RenderTdProps = {
  resourceData: StorageMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

const ProviderRow: FC<RowProps<StorageMapData>> = ({ resourceData, resourceFields }) => (
  <Tr>{renderResourceRowCells(resourceFields, resourceData, renderTd)}</Tr>
);

export default ProviderRow;
