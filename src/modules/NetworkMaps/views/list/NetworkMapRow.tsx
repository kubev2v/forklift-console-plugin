import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';

import { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { CellProps } from './components/CellProps';
import { NamespaceCell } from './components/NamespaceCell';
import { NetworkMapLinkCell } from './components/NetworkMapLinkCell';
import { PlanCell } from './components/PlanCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { StatusCell } from './components/StatusCell';
import { NetworkMapActionsDropdown } from '../../actions/NetworkMapActionsDropdown';
import { NetworkMapData } from '../../utils/types/NetworkMapData';

const ProviderRow: React.FC<RowProps<NetworkMapData>> = ({
  resourceFields,
  resourceData,
}) => {
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

const cellRenderers: Record<string, React.FC<CellProps>> = {
  ['name']: NetworkMapLinkCell,
  ['namespace']: NamespaceCell,
  ['owner']: PlanCell,
  ['phase']: StatusCell,
  ['destination']: ProviderLinkCell,
  ['source']: ProviderLinkCell,
  ['actions']: (props) => NetworkMapActionsDropdown({ isKebab: true, ...props }),
};

interface RenderTdProps {
  resourceData: NetworkMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export default ProviderRow;
