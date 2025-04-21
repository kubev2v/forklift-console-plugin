import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { NetworkMapActionsDropdown } from '../../actions/NetworkMapActionsDropdown';
import type { NetworkMapData } from '../../utils/types/NetworkMapData';

import type { CellProps } from './components/CellProps';
import { NamespaceCell } from './components/NamespaceCell';
import { NetworkMapLinkCell } from './components/NetworkMapLinkCell';
import { PlanCell } from './components/PlanCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { StatusCell } from './components/StatusCell';

const ProviderRow: FC<RowProps<NetworkMapData>> = ({ resourceData, resourceFields }) => {
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </Tr>
  );
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

const cellRenderers: Record<string, FC<CellProps>> = {
  actions: (props) => <NetworkMapActionsDropdown isKebab {...props} />,
  destination: ProviderLinkCell,
  name: NetworkMapLinkCell,
  namespace: NamespaceCell,
  owner: PlanCell,
  phase: StatusCell,
  source: ProviderLinkCell,
};

type RenderTdProps = {
  resourceData: NetworkMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export default ProviderRow;
