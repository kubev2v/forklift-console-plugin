import React from 'react';

import { ResourceField, RowProps } from '@kubev2v/common';
import { Td, Tr } from '@patternfly/react-table';

import { NetworkMapActionsDropdown } from '../../actions';
import { NetworkMapData } from '../../utils';

import {
  CellProps,
  NamespaceCell,
  NetworkMapLinkCell,
  PlanCell,
  ProviderLinkCell,
  StatusCell,
} from './components';

export const ProviderRow: React.FC<RowProps<NetworkMapData>> = ({
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
