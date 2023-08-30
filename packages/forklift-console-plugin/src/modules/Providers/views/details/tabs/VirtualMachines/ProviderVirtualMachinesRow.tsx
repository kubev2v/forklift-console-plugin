import React from 'react';

import { ResourceField, RowProps } from '@kubev2v/common';
import { ProviderVirtualMachine } from '@kubev2v/types';
import { Td, Tr } from '@patternfly/react-table';

import { VMCellProps, VMConcernsCellRenderer, VMNameCellRenderer } from './components';

export interface VmData {
  vm: ProviderVirtualMachine;
  name: string;
  concerns: string;
}

export const ProviderVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
  resourceFields,
  resourceData,
}) => {
  return (
    <Tr ouiaId={undefined} ouiaSafe={undefined}>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </Tr>
  );
};

export const defaultCellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: VMNameCellRenderer,
  concerns: VMConcernsCellRenderer,
};

export const renderTd = ({
  resourceData,
  resourceFieldId,
  resourceFields,
  cellRenderers = defaultCellRenderers,
}: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

interface RenderTdProps {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
  cellRenderers?: Record<string, React.FC<VMCellProps>>;
}
