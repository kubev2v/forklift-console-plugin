import React from 'react';

import { RowProps } from 'src/components/common/TableView/types';
import { ResourceField } from '@forklift/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { StorageMapActionsDropdown } from '../../actions';
import { StorageMapData } from '../../utils';

import {
  CellProps,
  NamespaceCell,
  PlanCell,
  ProviderLinkCell,
  StatusCell,
  StorageMapLinkCell,
} from './components';

export const ProviderRow: React.FC<RowProps<StorageMapData>> = ({
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
