import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { createStatusCell } from 'src/components/table/utils/createStatusCell';

import TableRow from '@components/common/DataViewTable/TableRow';
import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import type { NetworkMapData } from '@utils/crds/maps/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import NetworkMapActionsDropdown from '../actions/NetworkMapActionsDropdown';

import type { CellProps } from './components/CellProps';
import { ErrorStatusCell } from './components/ErrorStatusCell';
import { NamespaceCell } from './components/NamespaceCell';
import { NetworkMapLinkCell } from './components/NetworkMapLinkCell';
import { PlanCell } from './components/PlanCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';

const cellRenderers: Record<string, FC<CellProps>> = {
  actions: (props) => <NetworkMapActionsDropdown {...props} />,
  destination: ProviderLinkCell,
  name: NetworkMapLinkCell,
  namespace: NamespaceCell,
  owner: PlanCell,
  phase: createStatusCell(ErrorStatusCell),
  source: ProviderLinkCell,
};

type RenderTdProps = {
  resourceData: NetworkMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

const renderTd = ({
  resourceData,
  resourceFieldId,
  resourceFields,
}: RenderTdProps): ReactElement => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? ((): ReactElement => <></>);
  return (
    <ResizableTd
      columnId={fieldId}
      dataLabel={fieldId}
      key={fieldId}
      resourceFields={resourceFields}
    >
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </ResizableTd>
  );
};

const ProviderRow: FC<RowProps<NetworkMapData>> = ({ resourceData, resourceFields }) => (
  <TableRow>{renderResourceRowCells(resourceFields, resourceData, renderTd)}</TableRow>
);

export default ProviderRow;
