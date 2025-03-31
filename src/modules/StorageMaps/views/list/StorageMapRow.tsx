import React from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { StorageMapActionsDropdown } from '../../actions';
import type { StorageMapData } from '../../utils';

import {
  type CellProps,
  NamespaceCell,
  PlanCell,
  ProviderLinkCell,
  StatusCell,
  StorageMapLinkCell,
} from './components';

export const ProviderRow: React.FC<RowProps<StorageMapData>> = ({
  resourceData,
  resourceFields,
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
  actions: (props) => StorageMapActionsDropdown({ isKebab: true, ...props }),
  destination: ProviderLinkCell,
  name: StorageMapLinkCell,
  namespace: NamespaceCell,
  owner: PlanCell,
  phase: StatusCell,
  source: ProviderLinkCell,
};

type RenderTdProps = {
  resourceData: StorageMapData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export default ProviderRow;
