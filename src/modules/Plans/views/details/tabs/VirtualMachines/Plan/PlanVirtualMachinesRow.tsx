import React from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import { ConditionsCellRenderer, type PlanVMsCellProps } from '../components';
import { NameCellRenderer } from '../components/NameCellRenderer';
import type { VMData } from '../types';

import ActionsCell from './ActionsCell';

export const PlanVirtualMachinesRow: React.FC<RowProps<VMData>> = ({
  resourceData,
  resourceFields,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
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

const cellRenderers: Record<string, React.FC<PlanVMsCellProps>> = {
  actions: ActionsCell,
  conditions: ConditionsCellRenderer,
  name: NameCellRenderer,
};

type RenderTdProps = {
  resourceData: VMData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};
