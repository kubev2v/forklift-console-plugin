import React from 'react';

import { ResourceField, RowProps } from '@kubev2v/common';
import { Td } from '@patternfly/react-table';

import { VirtualMachinesActionsDropdownMemo } from '../actions/VirtualMachinesActionsDropdown';
import { ConditionsCellRenderer, PlanVMsCellProps } from '../components';
import { NameCellRenderer } from '../components/NameCellRenderer';
import { PlanData, VMData } from '../types';
interface PlanVirtualMachinesRowProps<T> extends RowProps<T> {
  planData: PlanData;
}

export const PlanVirtualMachinesRow: React.FC<PlanVirtualMachinesRowProps<VMData>> = ({
  resourceFields,
  resourceData,
  planData,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields, planData }),
      )}
    </>
  );
};

const renderTd = ({ resourceData, resourceFieldId, resourceFields, planData }: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer
        data={resourceData}
        fieldId={fieldId}
        fields={resourceFields}
        planData={planData}
      />
    </Td>
  );
};

const cellRenderers: Record<string, React.FC<PlanVMsCellProps>> = {
  name: NameCellRenderer,
  conditions: ConditionsCellRenderer,
  actions: VirtualMachinesActionsDropdownMemo,
};

interface RenderTdProps {
  resourceData: VMData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
  planData: PlanData;
}
