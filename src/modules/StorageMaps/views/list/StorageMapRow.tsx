import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';

import { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { CellProps } from './components/CellProps';
import { NamespaceCell } from './components/NamespaceCell';
import { PlanCell } from './components/PlanCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { StatusCell } from './components/StatusCell';
import { StorageMapLinkCell } from './components/StorageMapLinkCell';
import { StorageMapActionsDropdown } from '../../actions/StorageMapActionsDropdown';
import { StorageMapData } from '../../utils/types/StorageMapData';

const ProviderRow: React.FC<RowProps<StorageMapData>> = ({
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
  ['name']: StorageMapLinkCell,
  ['namespace']: NamespaceCell,
  ['owner']: PlanCell,
  ['phase']: StatusCell,
  ['destination']: ProviderLinkCell,
  ['source']: ProviderLinkCell,
  ['actions']: (props) => StorageMapActionsDropdown({ isKebab: true, ...props }),
};

interface RenderTdProps {
  resourceData: StorageMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export default ProviderRow;
